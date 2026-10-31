---
name: testes-backend
description: >-
  Orienta a criação, revisão, arquitetura e execução obrigatória de testes de backend Java/Quarkus (unitários, integração, API com REST Assured, persistência, autorização, concorrência, isolamento entre tenants e regressão). Use sempre que for solicitado criar, revisar, diagnosticar ou executar testes no backend, validar regras de negócio, verificar segurança ou investigar regressões.
---

# Skill: Testes de Backend (Quarkus & Java 25)

Esta skill orienta de forma rigorosa e padronizada a criação, revisão, refatoração e execução de testes automatizados no backend Quarkus do projeto **E-Commerce de Drones**.

---

## 🚨 Mandato Inviolável: Observabilidade e Execução Obrigatória

1. **PROIBIDO Declarar Testes como "Aprovados" Sem Execução Real**:
   - É estritamente vedado ao agente assumir, inferir ou afirmar que um teste "passou", "está verde" ou "foi aprovado" sem tê-lo executado efetivamente no terminal e inspecionado sua saída real.
   - Qualquer conclusão de teste deve obrigatoriamente reportar:
     - **Comando executado** (ex: `./mvnw test -Dtest=PedidoResourceTest`).
     - **Status de saída** (`BUILD SUCCESS` ou `BUILD FAILURE`, código de retorno).
     - **Métricas reais da suíte**: número de testes executados, aprovados, falhas, erros e ignorados (`Tests run: X, Failures: Y, Errors: Z, Skipped: W`).
     - **Tempo de execução** reportado pelo Surefire.
     - Em caso de falha: stacktrace completo da falha com causa raiz identificada e plano de correção.

2. **Foco no Comportamento Observável**:
   - Teste o que o sistema **faz e produz** (respostas HTTP, status codes, corpos JSON, alterações atômicas no banco de dados, eventos disparados), e não meros detalhes internos de implementação frágil.
   - Não use mocks cegos para contornar o banco de dados quando o comportamento depende de transações JPA, constraints de unicidade, chaves estrangeiras ou locks. O banco real PostgreSQL deve ser exercitado.

---

## 🛠️ Stack Tecnológica de Testes

| Componente | Tecnologia / Biblioteca | Finalidade |
| :--- | :--- | :--- |
| **Runtime & Linguagem** | Java 25 (OpenJDK) | Suporte a Records DTOs, Pattern Matching e Virtual Threads |
| **Framework Base** | Quarkus 3.32.4 | Injeção de dependências CDI (`@Inject`), Arc, DevServices |
| **Test Runner** | JUnit 5 (`org.junit.jupiter.api.*`) | Anotações `@Test`, `@BeforeEach`, `@DisplayName`, `@Nested` |
| **Testes de API REST** | REST Assured (`io.restassured.RestAssured.*`) | Testes HTTP de ponta a ponta com DSL `given().when().then()` |
| **Segurança & JWT** | `quarkus-test-security` | Simulação de credenciais com `@TestSecurity` e `@JwtSecurity` |
| **Banco de Dados** | PostgreSQL real (Porta 5432 ou Dev Services) | Validação de constraints reais, rollback e queries Panache |
| **Mocks Controlados** | Quarkus Mockito (`@InjectMock`) | Isolamento de IO externo não determinístico (ex: envio de e-mails via Mailer) |

---

## 📐 Pirâmide e Tipos de Testes no Backend

```
          / \
         /   \       Testes de Concorrência & Carga
        / API \      Testes de API REST (REST Assured + @QuarkusTest)
       / Integração \  Testes de Integração & Persistência (Services + Panache + PostgreSQL)
      /   Unitários  \ Testes Unitários de Domínio (Lógicas puras, Mappers, Regras isoladas)
     /----------------\
```

### 1. Testes Unitários (Rápidos, sem contexto Quarkus pesado)
- **Quando usar**: Lógicas matemáticas puras (cálculo de desconto promocional), validações de domínio isoladas, mappers estáticos DTO $\leftrightarrow$ Entidade.
- **Estrutura**: JUnit 5 puro ou `@ExtendWith(MockitoExtension.class)`.

### 2. Testes de Integração e Persistência (`@QuarkusTest`)
- **Quando usar**: Services e Repositories que interagem diretamente com o banco de dados PostgreSQL.
- **Validações**: Atomicidade `@Transactional`, consultas Panache, rollback após exceções, relacionamentos JPA (cascade, orphanRemoval).

### 3. Testes de API / REST Assured (`@QuarkusTest`)
- **Quando usar**: Controllers REST JAX-RS (`*Controller.java`).
- **Validações**: Rotas HTTP, status codes semânticos (200, 201, 204, 400, 401, 403, 404), serialização Jackson com Java Records, validação de inputs Bean Validation.

### 4. Testes de Autorização & Isolamento de Tenants
- **Quando usar**: Todos os endpoints protegidos com `@RolesAllowed` ou `@Authenticated`.
- **Validações**: Usuário anônimo (401), perfil inadequado (403), e isolamento estrito entre usuários (Cliente A não acessa dados do Cliente B).

### 5. Testes de Concorrência e Transações
- **Quando usar**: Operações concorrentes críticas, especialmente controle de estoque, criação simultânea de pedidos e liquidação de pagamentos.
- **Validações**: `ExecutorService` com `CountDownLatch` para simular requisições paralelas e garantir ausência de estoque negativo ou inconsistência atômica.

---

## 🎯 A Matriz de Cobertura Obrigatória (Os 12 Pilares)

Todo novo endpoint, serviço ou refatoração deve passar pela verificação da **Matriz de Cobertura Obrigatória**:

| # | Pilar | O Que Testar Obrigatoriamente | Código HTTP / Resultado Esperado |
| :---: | :--- | :--- | :--- |
| **1** | **Caminho Feliz (Sucesso)** | Payload válido, processamento correto, persistência integral e retorno de DTO esperado | `200 OK` / `201 CREATED` / `204 NO CONTENT` |
| **2** | **Erro de Negócio** | Violação de regras semânticas (ex: estoque insuficiente, modelo não pertence à marca) | `400 BAD REQUEST` via `ValidationException` |
| **3** | **Validações de Campo** | `@NotBlank`, `@Email`, `@CNPJ`, `@Size`, regex de CPF, limites de fotos (máx 5), nota (1-5) | `400 BAD REQUEST` via Bean Validation estruturado |
| **4** | **Autenticação** | Requisições a endpoints protegidos sem token JWT ou com token inválido/expirado | `401 UNAUTHORIZED` |
| **5** | **Autorização (RBAC)** | Cliente comum tentando acessar rotas administrativas (ex: `POST /drones`, `POST /usuarios/admin`) | `403 FORBIDDEN` |
| **6** | **Isolamento de Tenants** | Cliente A tentando ler, atualizar ou cancelar o pedido/endereço pertencente ao Cliente B | `403 FORBIDDEN` ou `404 NOT FOUND` |
| **7** | **Referências Cruzadas** | Cadastro com entidades cruzadas incompatíveis (ex: Drone associando Marca DJI com Modelo Autel) | `400 BAD REQUEST` com mensagem específica de erro |
| **8** | **Transações & Atomicidade** | Falha no meio da criação do pedido (ex: 2º item sem estoque) reverte todos os débitos prévios | Nenhuma alteração persistida; rollback total verificado |
| **9** | **Conflitos de Agenda/Vigência** | Promoção com data futura ou expirada não concede desconto; promoção vigente aplica desconto exato | Preço calculado confere com regras matemáticas de vigência |
| **10** | **Histórico & Imutabilidade** | Alterar o endereço principal do cliente NÃO altera o endereço de pedidos já criados; preço unitário gravado não muda se catálogo alterar | Snapshot de entrega e `precoUnitario` inalterados |
| **11** | **Concorrência** | 10 requisições simultâneas disputando 2 itens restantes em estoque | Exatamente 2 sucessos e 8 rejeições; estoque final = 0 |
| **12** | **Regressão** | Verificação de que novas implementações não quebraram fluxos ou contratos de endpoints existentes | 100% da suíte de regressão passando sem falhas |

---

## 📋 Protocolo de Execução Passo a Passo

Sempre que a tarefa envolver testes, siga rigorosamente este fluxo:

```
[1. Mapear Cenários] ➔ [2. Escrever Testes] ➔ [3. Executar via Maven] ➔ [4. Inspecionar Saída] ➔ [5. Corrigir e Reexecutar] ➔ [6. Emitir Evidências]
```

### Passo 1: Mapear os Cenários da Matriz
Antes de escrever código de teste, liste explicitamente os cenários que cobrem os 12 pilares aplicáveis àquele recurso.

### Passo 2: Implementar os Testes
- Localize o arquivo de teste em `backend/src/test/java/drones/...`.
- Siga a convenção de nomenclatura descritiva: `deve[AcaoEsperada]Quando[Cenario]`.
- Utilize `@TestSecurity` para simular usuários sem acoplamento a serviços de login externos:
  ```java
  @TestSecurity(user = "cliente_teste", roles = "CLIENTE")
  ```

### Passo 3: Executar via Maven
Execute os testes no terminal com o wrapper Maven do projeto:
```bash
# Executar uma classe de teste específica:
cd backend && ./mvnw test -Dtest=PedidoResourceTest

# Executar um método específico de um teste:
cd backend && ./mvnw test -Dtest=PedidoResourceTest#deveCriarPedidoComSucessoQuandoEstoqueDisponivel

# Executar toda a suíte de testes:
cd backend && ./mvnw test
```

### Passo 4: Inspecionar Saída Real e Evidências
Analise o log do Maven:
- Houve compilação limpa?
- O contexto Quarkus subiu corretamente?
- Quantos testes foram executados? Quantos passaram? Houve falha?
- **NUNCA deduza o resultado sem ler a saída do processo.**

### Passo 5: Corrigir até 100% Verde Real
Se algum teste falhar:
1. Examine a falha (asserção incorreta, erro 500 não tratado, violação de constraint de banco, erro de DTO).
2. Corrija a implementação ou o teste.
3. Reexecute **obrigatoriamente** o comando Maven até obter `BUILD SUCCESS`.

### Passo 6: Reportar com Evidências Observáveis
Ao responder ao usuário, forneça a tabela resumo com o comando executado e o resultado observado:
```markdown
### 📊 Resultado Observável da Execução dos Testes
- **Comando**: `./mvnw test -Dtest=PedidoResourceTest`
- **Status**: BUILD SUCCESS (Exit Code: 0)
- **Resultados**: Tests run: 8, Failures: 0, Errors: 0, Skipped: 0
- **Tempo**: 3.421 s
- **Cenários Validados**: Sucesso, Estoque Insuficiente (400), Snapshot Imutável, Autenticação (401), Autorização (403), Isolamento de Pedidos (403).
```

---

## 📚 Documentos de Referência e Exemplos

Consulte os arquivos complementares incluídos nesta skill para templates detalhados e código executável:

- [**Guia de Arquitetura e Configuração Quarkus**](./references/arquitetura-testes-quarkus.md): Setup de perfil `%test`, anotações Quarkus, DevServices e REST Assured.
- [**Matriz Exaustiva de Cobertura de Casos**](./references/matriz-cobertura-casos.md): Lista de verificação prática cobrindo cada módulo do E-Commerce de Drones.
- [**Guia de Concorrência e Transações**](./references/concorrencia-e-transacoes.md): Padrões para testar race conditions de estoque e rollback atômico.
- [**Exemplo: Teste de API REST de Pedidos**](./examples/PedidoResourceTest.java): Implementação completa com REST Assured, `@TestSecurity` e validações de DTO.
- [**Exemplo: Teste de Concorrência de Estoque**](./examples/EstoqueConcorrenciaTest.java): Implementação com `ExecutorService` e `CountDownLatch`.
- [**Exemplo: Teste de Integridade Marca-Modelo**](./examples/DroneIntegridadeReferencialTest.java): Implementação de validação de referências cruzadas.
- [**Script de Execução Automatizada**](./scripts/run-tests.sh): Script utilitário para disparar testes com formatação e diagnóstico.
