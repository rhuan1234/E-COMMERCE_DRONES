# Guia de Testes de Concorrência e Transações em Quarkus

Testes de concorrência e atomicidade garantem que operações simultâneas críticas — especialmente controle de estoque, criação de pedidos e liquidação de pagamentos — não corrompam os dados do sistema.

---

## 1. O Problema da Concorrência no E-Commerce

Imagine um cenário com estoque escasso:
- Drone DJI Mavic 3 possui apenas **1 unidade disponível** em estoque (`quantidadeDisponivel = 1`).
- Dois clientes simultâneos (Cliente A e Cliente B) clicam em "Finalizar Pedido" exatamente no mesmo instante de milissegundo.
- **Comportamento Incorreto (Race Condition)**: Se a verificação e a baixa de estoque não forem atômicas, ambas as transações lerão `quantidadeDisponivel = 1`, aprovarão o pedido e gravarão `1 - 1 = 0`, resultando em 2 pedidos confirmados para apenas 1 produto físico (overselling) ou estoque negativo (`-1`).
- **Comportamento Correto Exigido**: Uma das transações adquire o recurso e conclui com sucesso (status `201 Created` / `PENDENTE`). A outra transação detecta estoque insuficiente ou falha de lock otimista e é rejeitada com erro semântico claro (`400 Bad Request` com mensagem de estoque insuficiente). O estoque final resultante deve ser estritamente `0`.

---

## 2. Padrão de Teste com `CountDownLatch` e `ExecutorService`

Para forçar um teste de concorrência real e determinístico no JUnit 5 com Quarkus, utilizamos um `CountDownLatch` de disparo simultâneo:

```java
package drones.concorrencia;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class EstoqueConcorrenciaManualTest {

    @Test
    @DisplayName("Garante que pedidos concorrentes respeitem o limite de estoque sem overselling")
    void devePrevenirOversellingEmConcorrencia() throws InterruptedException {
        int numeroDeThreads = 10;
        int estoqueInicial = 3; // Supondo um drone preparado com 3 unidades

        ExecutorService executor = Executors.newFixedThreadPool(numeroDeThreads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(numeroDeThreads);

        AtomicInteger sucessos = new AtomicInteger(0);
        AtomicInteger falhasEstoque = new AtomicInteger(0);

        for (int i = 0; i < numeroDeThreads; i++) {
            final int clienteId = i + 1;
            executor.submit(() -> {
                try {
                    // Todas as threads aguardam neste ponto para disparar juntas
                    startLatch.await();

                    // Simula requisição REST ou chamada de serviço
                    int statusCode = executarRequisicaoPedido(clienteId);

                    if (statusCode == 201) {
                        sucessos.incrementAndGet();
                    } else if (statusCode == 400) {
                        falhasEstoque.incrementAndGet();
                    }
                } catch (Exception e) {
                    falhasEstoque.incrementAndGet();
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        // Disparo unificado de todas as threads
        startLatch.countDown();

        // Aguarda todas concluírem com timeout de segurança
        boolean concluiuEmTempo = doneLatch.await(15, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(concluiuEmTempo, "O teste demorou mais do que o esperado para responder");
        assertEquals(estoqueInicial, sucessos.get(), "O número de pedidos aprovados deve ser igual ao estoque inicial");
        assertEquals(numeroDeThreads - estoqueInicial, falhasEstoque.get(), "As requisições excedentes devem ser rejeitadas");
    }

    private int executarRequisicaoPedido(int clienteId) {
        // Implementação da chamada HTTP ou de Service
        return 201;
    }
}
```

---

## 3. Teste de Atomicidade Transacional (`@Transactional` Rollback)

Quando uma operação compõe múltiplas etapas (ex: baixa de estoque de 3 drones diferentes em um mesmo pedido):
- Se o primeiro e o segundo item forem reservados com sucesso, mas o terceiro falhar por qualquer motivo (falta de estoque, erro de validação ou erro de banco), **a transação inteira DEVE sofrer rollback**.
- **Como Testar a Atomicidade**:
  1. Registre o estoque inicial do Item 1: `estoqueInicial1 = drone1.quantidadeDisponivel`.
  2. Envie um pedido com o Item 1 (válido) e um Item 2 inválido (ex: quantidade solicitada 9999).
  3. Verifique que a API retornou `400 Bad Request`.
  4. Recarregue a entidade `drone1` do banco de dados e faça o assert:
     ```java
     Drone droneRecarregado = Drone.findById(drone1.getId());
     assertEquals(estoqueInicial1, droneRecarregado.getQuantidadeDisponivel(),
         "O estoque do item 1 não pode ter sido debitado parcialmente!");
     ```
  5. Verifique que nenhum registro `Pedido` ou `ItemPedido` orfão foi persistido no banco.

---

## 4. Teste de Cancelamento com Estorno Atômico

O cancelamento de um pedido deve devolver rigorosamente as quantidades de todos os itens ao estoque de forma atômica:

```java
@Test
@DisplayName("Cancelamento de pedido deve estornar integralmente as quantidades ao estoque")
void deveEstornarEstoqueAoCancelarPedido() {
    // 1. Arrange: Cria pedido de 2 unidades do Drone A (estoque antes = 10, depois = 8)
    // 2. Act: PATCH /pedidos/{id}/cancelar
    // 3. Assert:
    //    - Status do Pedido vira CANCELADO
    //    - Status do Pagamento vira CANCELADO
    //    - Estoque do Drone A volta a ser 10
}
```

---

## 5. Boas Práticas para Concorrência em Quarkus
1. **Timeout Definido**: Sempre use `doneLatch.await(X, TimeUnit.SECONDS)` com timeout explícito para que threads travadas não congelem a suíte de testes.
2. **Virtual Threads (Java 25)**: Em testes de alta concorrência com Quarkus e Java 25, você pode utilizar `Executors.newVirtualThreadPerTaskExecutor()` para simular dezenas de clientes simultâneos de forma leve e eficiente.
3. **Asserts Thread-Safe**: Utilize classes do pacote `java.util.concurrent.atomic` (`AtomicInteger`, `AtomicReference`, `ConcurrentLinkedQueue`) para coletar métricas e resultados dentro das threads de teste.
