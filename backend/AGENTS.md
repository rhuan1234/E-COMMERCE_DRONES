# AGENTS.md - Backend (Quarkus & Java 25)

Este documento define as instruções mandatórias, arquitetura, convenções, regras de negócio e procedimentos operacionais para agentes de IA e desenvolvedores que atuam no módulo **Backend** da plataforma **E-Commerce de Drones**.

---

## 1. Objetivo do Projeto
O backend do **E-Commerce de Drones** é uma API REST corporativa desenvolvida para gerenciar todas as operações de uma plataforma especializada em comércio eletrônico de drones profissionais e recreativos, sensores ópticos/câmeras de alta precisão, peças e acessórios.

A API atende a dois perfis principais de usuários:
1. **Administrador (`ADMIN`)**: Gestão de catálogo (drones, câmeras, marcas, modelos), controle de estoque, credenciamento e auditoria de fornecedores, campanhas promocionais temporais, supervisão de pedidos, aprovação/estorno de transações e criação de novos administradores.
2. **Cliente (`CLIENTE`)**: Cadastro público e autenticação segura, exploração de catálogo, galeria de imagens, gestão de múltiplos endereços de entrega com seleção de endereço principal, inclusão e remoção de favoritos, avaliação de produtos adquiridos, criação de pedidos com congelamento de preços e snapshot de entrega, pagamento polimórfico (PIX e Cartão de Crédito) e cancelamento com estorno automático de estoque.

---

## 2. Stack e Arquitetura

### 2.1 Tecnologias e Dependências Principais
- **Linguagem & Runtime**: Java 25 (OpenJDK).
- **Framework Principal**: Quarkus v3.32.4.
- **Camada REST**: Quarkus REST (`quarkus-rest`, `quarkus-rest-jackson`) com Jackson para serialização JSON.
- **Documentação de API**: SmallRye OpenAPI (`quarkus-smallrye-openapi` / Swagger UI em `/q/swagger-ui/`).
- **Persistência de Dados**: Hibernate ORM com Panache (`quarkus-hibernate-orm-panache`), PostgreSQL (`quarkus-jdbc-postgresql`). Banco local padrão: `dronesDb` na porta `5432` (`postgres:123456`).
- **Validação**: Hibernate Validator (`quarkus-hibernate-validator` com Bean Validation 3.0 e `@CNPJ`).
- **Segurança & Criptografia**: SmallRye JWT (`quarkus-smallrye-jwt`) com assinatura por chaves assimétricas RSA (`privateKey.pem` e `publicKey.pem`), e BCrypt (`jbcrypt` 0.4) para hash de senhas.
- **E-mails Transacionais**: Quarkus Mailer (`quarkus-mailer`), configurado para Mailtrap em desenvolvimento.
- **Agendamento de Tarefas**: Quarkus Scheduler (`quarkus-scheduler`).
- **Testes**: JUnit 5, RestAssured, Quarkus Test Security e Mockito.

### 2.2 Estrutura e Organização de Pastas (`backend/src/main/`)
```
backend/
├── src/main/
│   ├── java/drones/
│   │   ├── dto/                  # Record DTOs de entrada e saída organizados por domínio
│   │   │   ├── auth/             # LoginRequestDTO, LoginResponseDTO
│   │   │   ├── drones/           # DroneRequestDTO, DroneResponseDTO, DroneResponseEcommerceDTO, etc.
│   │   │   ├── fornecedores/     # FornecedorRequestDTO, FornecedorResponseDTO, etc.
│   │   │   ├── pedidos/          # PedidoRequestDTO, PedidoResponseDTO, PagamentoDTOs
│   │   │   ├── promocao/         # PromocaoRequestDTO, PromocaoResponseDTO
│   │   │   ├── usuarios/         # ClienteRequestDTO, AdminRequestDTO, EnderecoDTOs
│   │   │   └── PageResponse.java # Encapsulador genérico de paginação da API
│   │   ├── exception/            # Exceções customizadas e infraestrutura de erro
│   │   │   ├── ProblemDetail.java
│   │   │   ├── ValidationException.java
│   │   │   ├── UnauthorizedException.java
│   │   │   └── mapper/           # Mappers JAX-RS para captura global de exceções
│   │   ├── mapper/               # Classes com mappers estáticos puros (Entidade <-> DTO)
│   │   ├── model/                # Entidades JPA Panache (PanacheEntityBase)
│   │   │   ├── drones/           # Drone, DroneImage, Camera, Marca, Modelo, Avaliacao, Favorito
│   │   │   ├── fornecedor/       # Fornecedor, Endereco, Cidade, Estado
│   │   │   ├── pedido/           # Pedido, ItemPedido, StatusPedido, Pagamento, PagamentoPix, PagamentoCartao
│   │   │   ├── promocao/         # Promocao
│   │   │   └── usuario/          # Usuario, Perfil, TokenResetarSenha
│   │   ├── repository/           # PanacheRepository<T> para queries customizadas
│   │   ├── resources/            # Controllers REST JAX-RS (*Controller.java)
│   │   └── services/             # Regras de negócio (*ServiceInterface.java e *Service.java)
│   └── resources/
│       ├── application.properties# Configuração de banco, JWT, mailer e CORS
│       ├── import.sql            # Carga inicial com dados semente para testes
│       └── META-INF/resources/   # Chaves RSA (publicKey.pem e privateKey.pem)
└── uploads/                      # Armazenamento físico de fotos de drones no servidor
```

---

## 3. Regras de Negócio (Mandatórias e Invioláveis)

Qualquer alteração nestes comportamentos exige aprovação formal e atualização imediata em `docs/REGRAS_NEGOCIO.md` e `docs/modelo.plantuml`:

1. **Integridade Marca-Modelo**:
   - Todo `Modelo` pertence obrigatoriamente a uma `Marca`.
   - Ao criar ou atualizar `Drone` ou `Camera`, é obrigatório validar se a marca informada corresponde à marca dona do modelo (`modelo.getMarca().getId() == marca.getId()`). Caso contrário, lançar `ValidationException`.
2. **Gerenciamento de Imagens do Drone**:
   - Limite máximo de **5 imagens por drone**. Tentativas de exceder esse número devem ser rejeitadas.
   - Apenas uma imagem pode ser a capa principal (`principal = true`). Ao definir uma nova imagem como principal, todas as outras do mesmo drone devem ser setadas para `principal = false`.
   - A exclusão de uma imagem do banco exige a remoção física do arquivo em `uploads/`. Se a imagem removida era a principal e restarem imagens, a primeira remanescente assume o posto de principal.
3. **Campanhas Promocionais**:
   - Uma promoção só tem efeito financeiro se a data corrente estiver dentro do intervalo de vigência: `agora >= dataInicio && agora <= dataFim`.
   - Cálculo do preço promocional: `precoFinal = precoOriginal * (1 - percentualDesconto / 100)`.
   - O preço promocional é aplicado dinamicamente na consulta e congelado no `ItemPedido` no momento da compra.
4. **Ciclo de Vida do Pedido e Controle Atômico de Estoque**:
   - **Criação do Pedido**:
     - Status inicial é sempre `StatusPedido.PENDENTE`.
     - Validação de estoque de cada item: se `quantidadeDisponivel < item.quantidade`, a transação é abortada com exceção.
     - Baixa imediata de estoque: `quantidadeDisponivel = quantidadeDisponivel - item.quantidade`.
     - **Snapshot Imutável de Endereço**: copiar os campos do endereço principal do cliente no ato da compra (`ruaEntrega`, `bairroEntrega`, `cidadeEntrega`, `estadoEntrega`, `cepEntrega`) para a entidade `Pedido`.
     - **Congelamento do Preço Unitário**: `ItemPedido.precoUnitario` grava o preço praticado na data/hora do pedido (com desconto vigente), tornando-se imutável.
   - **Cancelamento do Pedido**:
     - Status do pedido muda para `CANCELADO` e do pagamento para `CANCELADO`.
     - **Estorno Automático**: a quantidade de cada item é devolvida ao estoque (`quantidadeDisponivel += item.quantidade`) sob anotação `@Transactional`.
5. **Polimorfismo de Pagamentos**:
   - O pedido aceita apenas uma tentativa de pagamento ativa (PIX ou Cartão).
   - O valor do pagamento deve ser estritamente igual ao `valorTotal` do pedido.
   - Não é permitido pagar pedidos com status `PAGO` ou `CANCELADO`.
   - Pagamento PIX gera chave UUID aleatória (`UUID.randomUUID().toString()`).
   - A liquidação do pagamento altera `statusPagamento` para `APROVADO` e `statusPedido` para `PAGO`.
6. **Usuários e Perfis**:
   - Endpoint público de registro (`POST /clientes`) cria unicamente usuários com `Perfil.CLIENTE`.
   - Criação de administradores (`POST /usuarios/admin`) exige perfil autenticado `Perfil.ADMIN`.
   - Um cliente não pode remover seu único endereço cadastrado. Ao marcar um endereço como principal, desmarcar os demais e atualizar `enderecoPrincipalId`.
   - Recuperação de senha gera `TokenResetarSenha` com validade de 2 horas e uso único (`usado = true`).

---

## 4. Convenções de Código

1. **Separação Estrita de Contratos (DTOs)**:
   - **NUNCA** retorne entidades JPA diretamente nos Controllers JAX-RS.
   - Use sempre Java Records para DTOs (`*RequestDTO`, `*ResponseDTO`).
   - Faça o mapeamento bidirecional exclusivamente em classes utilitárias `*Mapper` com métodos estáticos puros (ex: `DroneMapper.toEntity(dto)` e `DroneMapper.toResponseDTO(entity)`).
2. **Injeção de Dependências & Transações**:
   - Utilize a injeção via `@Inject` nos Services e Controllers.
   - Mantenha a separação entre contrato (`*ServiceInterface.java`) e implementação (`*Service.java`).
   - Todo método de escrita ou alteração no banco de dados nos Services DEVE conter a anotação `@Transactional`.
3. **Tratamento Global de Exceções**:
   - Não use `try-catch` genérico para silenciar erros de validação.
   - Lance `ValidationException("mensagem", "campo")` para falhas de regra de negócio. O `ValidationExceptionMapper` converterá para HTTP 400 estruturado.
   - Anote DTOs com Bean Validation (`@Valid`, `@NotNull`, `@NotBlank`, `@Size`, `@Email`, `@CNPJ`) para captura automática via `ConstraintViolationExceptionMapper`.
4. **Padronização de Respostas REST**:
   - Respostas de criação devem retornar status HTTP 201: `Response.status(Status.CREATED).entity(dto).build()`.
   - Respostas paginadas devem retornar instâncias de `PageResponse<T>` contendo `{ items, page, pageSize, totalItems, totalPages }`.
5. **Nomenclatura**:
   - Classes em `PascalCase`, métodos e atributos em `camelCase`, constantes e enums em `UPPER_SNAKE_CASE`.
   - Endpoints REST devem utilizar caminhos no plural (ex: `/drones`, `/marcas`, `/pedidos`, `/clientes`).

---

## 5. Testes e Validação

### 5.1 Comandos de Execução
```bash
# Executar em modo desenvolvimento (Live-Reload e DevServices):
./mvnw quarkus:dev

# Compilar e validar tipos Java 25:
./mvnw compile

# Executar suite completa de testes unitários e de integração:
./mvnw test

# Executar um teste específico:
./mvnw test -Dtest=NomeDoTesteTest

# Build completo com verificação (failsafe / integration-test):
./mvnw verify
```

### 5.2 Critérios de Aceite
- O código deve compilar sem erros com o JDK 25.
- Todos os endpoints devem validar os inputs e responder com códigos HTTP semânticos (200, 201, 204, 400, 401, 403, 404).
- Operações atômicas (reserva de estoque, cancelamento com estorno, liquidação de pagamento) não podem deixar o banco em estado inconsistente.
- A documentação interativa OpenAPI/Swagger deve estar operacional em `http://localhost:8080/q/swagger-ui/`.

---

## 6. Fontes de Verdade

Antes de codificar, consulte os documentos centrais no diretório `docs/`:
1. [**`../docs/CONTEXTO_PROJETO.md`**](file:///home/leandro/Programas/unitins/topicos-2/E-COMMERCE_DRONES/docs/CONTEXTO_PROJETO.md): Visão de produto, stack tecnológica, decisões arquiteturais tomadas e roadmap de pendências.
2. [**`../docs/REGRAS_NEGOCIO.md`**](file:///home/leandro/Programas/unitins/topicos-2/E-COMMERCE_DRONES/docs/REGRAS_NEGOCIO.md): Especificação exaustiva de todas as regras de negócio, validações de campos e fluxos do domínio.
3. [**`../docs/modelo.plantuml`**](file:///home/leandro/Programas/unitins/topicos-2/E-COMMERCE_DRONES/docs/modelo.plantuml): Diagrama de classes PlantUML de todas as entidades, tipos e relacionamentos JPA.
4. [**`backend/src/main/resources/import.sql`**](file:///home/leandro/Programas/unitins/topicos-2/E-COMMERCE_DRONES/backend/src/main/resources/import.sql): Carga de dados semente de referência para testes locais.
5. [**`../frontend/docs/backend-response.md`**](file:///home/leandro/Programas/unitins/topicos-2/E-COMMERCE_DRONES/frontend/docs/backend-response.md): Contrato de payloads JSON (sucesso, erro e paginação) compartilhado com o frontend.

---

## 7. Segurança e Limites

1. **Autenticação Stateless com JWT**:
   - Assinatura com chave privada RSA (`META-INF/resources/privateKey.pem`).
   - Validação com chave pública RSA (`META-INF/resources/publicKey.pem`).
   - NUNCA exponha ou compartilhe chaves privadas em endpoints públicos ou logs.
2. **Controle de Acesso por Papel**:
   - Endpoints administrativos devem conter obrigatoriamente `@RolesAllowed("ADMIN")`.
   - Endpoints de clientes autenticados devem utilizar `@RolesAllowed({"CLIENTE", "ADMIN"})` ou `@Authenticated`.
   - O usuário autenticado DEVE ser identificado através do `JsonWebToken jwt` injetado (`jwt.getName()`), e NUNCA por um ID arbitrário fornecido no payload da requisição pelo cliente para ações de perfil próprio.
3. **Criptografia e Dados Sensíveis**:
   - Senhas devem ser sempre criptografadas com BCrypt antes de persistir.
   - NUNCA trafegue dados de cartão de crédito em texto plano ou armazene o código CVV de forma definitiva.
   - Dados sensíveis e hashes não devem ser expostos nos DTOs de resposta nem impressos nos logs do console.
4. **Prevenção de Vulnerabilidades**:
   - Proibido uso de consultas nativas com concatenação direta de strings (SQL Injection). Utilize métodos do Panache com bind parameters nomeados.
   - O upload de imagens deve validar a extensão, tipo MIME e restringir o caminho de gravação para impedir ataques de *Path Traversal*.

---

## 8. Fluxo de Trabalho do Agente

Ao receber uma demanda relacionada ao backend, siga rigorosamente as seguintes etapas:
1. **Consultar as Fontes de Verdade**: Leia `docs/REGRAS_NEGOCIO.md` e `docs/modelo.plantuml` para garantir que o comportamento desejado está alinhado com o domínio.
2. **Sincronizar o Modelo de Dados**: Se a alteração envolver adição/modificação de entidades ou campos, atualize primeiro `docs/modelo.plantuml` e os inserts equivalentes em `backend/src/main/resources/import.sql`.
3. **Construir Contratos (DTOs)**: Crie os Java Records em `drones.dto.*` com as devidas anotações de validação (`@NotBlank`, `@NotNull`, etc.).
4. **Implementar/Atualizar Mappers**: Crie ou ajuste os métodos estáticos em `drones.mapper.*`.
5. **Implementar Regras no Service**: Escreva a lógica na interface e implementação de `drones.services.*`, aplicando `@Transactional` e lançando `ValidationException` nos casos de violação.
6. **Implementar o Resource**: Exponha os endpoints em `drones.resources.*` com anotações JAX-RS, `@Valid` e restrições de `@RolesAllowed`.
7. **Testar e Compilar**: Execute `./mvnw compile` e `./mvnw test` para certificar-se de que a build está íntegra.
8. **Atualizar a Documentação**: Se regras de negócio foram alteradas, atualize `docs/REGRAS_NEGOCIO.md`. Atualize o status de implementação em `docs/CONTEXTO_PROJETO.md`.

---

## 9. Skills e Ferramentas Aplicáveis

- **Quarkus Dev Mode**: Utilize o live-reload (`./mvnw quarkus:dev`) para validação rápida de alterações sem necessidade de reiniciar a JVM.
- **Swagger UI**: Acesse `http://localhost:8080/q/swagger-ui/` para validar schemas JSON, payloads e testar requisições diretamente.
- **Mailtrap**: Verifique o recebimento de e-mails de recuperação de senha com tokens UUID em desenvolvimento.
- **PostgreSQL CLI / DBeaver**: Conecte ao banco `dronesDb` (`localhost:5432`) para auditoria de tabelas e integridade referencial.
- **RestAssured / JUnit 5**: Utilize para estruturar testes de ponta a ponta simulando chamadas HTTP autenticadas com tokens mockados.
