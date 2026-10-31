package drones.concorrencia;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import drones.exception.ValidationException;
import drones.model.drones.Drone;
import drones.model.drones.Marca;
import drones.model.drones.Modelo;
import drones.model.fornecedor.Fornecedor;
import drones.model.pedido.ItemPedido;
import drones.model.pedido.Pedido;
import drones.model.usuario.Usuario;
import drones.repository.DroneRepository;
import drones.repository.FornecedorRepository;
import drones.repository.MarcaRepository;
import drones.repository.ModeloRepository;
import drones.repository.UsuarioRepository;
import drones.services.PedidoService;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Exemplo de Teste de Concorrência e Atomicidade.
 * Simula múltiplas threads competindo simultaneamente pelo estoque limitado de um drone.
 */
@QuarkusTest
public class EstoqueConcorrenciaTest {

    @Inject
    PedidoService pedidoService;

    @Inject
    DroneRepository droneRepository;

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    MarcaRepository marcaRepository;

    @Inject
    ModeloRepository modeloRepository;

    @Inject
    FornecedorRepository fornecedorRepository;

    @Test
    @DisplayName("Garante que múltiplas requisições simultâneas não gerem overselling no estoque")
    void devePrevenirOversellingComConcorrenciaReal() throws InterruptedException {
        // Cenário: Criar um drone de teste com apenas 2 unidades disponíveis
        int estoqueInicial = 2;
        int totalClientesConcorrentes = 6;

        Long droneId = criarDroneParaTeste(estoqueInicial);
        Long usuarioId = 2L; // Usuário cliente existente no import.sql

        ExecutorService executor = Executors.newFixedThreadPool(totalClientesConcorrentes);
        CountDownLatch startSignal = new CountDownLatch(1);
        CountDownLatch doneSignal = new CountDownLatch(totalClientesConcorrentes);

        AtomicInteger comprasComSucesso = new AtomicInteger(0);
        AtomicInteger comprasRejeitadasPorEstoque = new AtomicInteger(0);

        for (int i = 0; i < totalClientesConcorrentes; i++) {
            executor.submit(() -> {
                try {
                    // Sincroniza todas as threads para dispararem exatamente no mesmo instante
                    startSignal.await();

                    Usuario cliente = usuarioRepository.findById(usuarioId);
                    Drone drone = droneRepository.findById(droneId);

                    Pedido pedido = new Pedido();
                    ItemPedido item = new ItemPedido();
                    item.setDrone(drone);
                    item.setQuantidade(1);
                    item.setPedido(pedido);
                    pedido.setItens(java.util.List.of(item));

                    pedidoService.criar(cliente, pedido);
                    comprasComSucesso.incrementAndGet();
                } catch (ValidationException ve) {
                    comprasRejeitadasPorEstoque.incrementAndGet();
                } catch (Exception e) {
                    comprasRejeitadasPorEstoque.incrementAndGet();
                } finally {
                    doneSignal.countDown();
                }
            });
        }

        // Disparo simultâneo
        startSignal.countDown();

        // Aguarda todas as tarefas finalizarem dentro do limite de 10 segundos
        boolean finalizouEmTempo = doneSignal.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(finalizouEmTempo, "O teste de concorrência excedeu o tempo limite");

        // Validações pós-execução
        assertEquals(estoqueInicial, comprasComSucesso.get(),
            "O total de compras bem-sucedidas deve ser estritamente igual ao estoque inicial");
        assertEquals(totalClientesConcorrentes - estoqueInicial, comprasRejeitadasPorEstoque.get(),
            "As requisições que excederam o estoque devem ter sido rejeitadas com ValidationException");

        // Verifica estado final persistido no banco
        Drone droneAposTestes = droneRepository.findById(droneId);
        assertEquals(0, droneAposTestes.getQuantidadeDisponivel(),
            "O estoque final do produto deve ser exatamente 0 e jamais negativo");
    }

    @Transactional
    Long criarDroneParaTeste(int estoque) {
        Marca marca = marcaRepository.findById(1L);
        Modelo modelo = modeloRepository.findById(1L);
        Fornecedor fornecedor = fornecedorRepository.findById(1L);

        Drone drone = new Drone();
        drone.setNome("Drone Concorrência Teste " + System.currentTimeMillis());
        drone.setMarca(marca);
        drone.setModelo(modelo);
        drone.setFornecedor(fornecedor);
        drone.setPreco(1000.0);
        drone.setQuantidadeDisponivel(estoque);
        drone.setAtiva(true);
        droneRepository.persist(drone);

        return drone.getId();
    }
}
