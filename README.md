# E-Commerce de Drones

Plataforma completa de comércio eletrônico para venda e gestão de drones de alta performance, sensores ópticos de precisão e acessórios, projetada para atender tanto criadores de conteúdo e entusiastas quanto empresas e operadores industriais.

---

## Por que

O mercado de drones de alta tecnologia demanda especificações técnicas aprofundadas (sensores, câmeras acopladas, autonomia de bateria, alcance e teto de serviço), compatibilidade rigorosa entre fabricantes e modelos, além de uma logística de entrega e estoque extremamente confiável. 

Em plataformas de comércio eletrônico generalistas, os compradores frequentemente sofrem com a carência de informações técnicas confiáveis, ausência de suporte visual aprofundado e risco de compras incompatíveis. Do lado do lojista, a gestão manual de estoque e as inconsistências fiscais por alterações de endereço posteriores à compra geram gargalos operacionais.

Este projeto resolve esses problemas entregando:
- **Para os Clientes**: Experiência de compra especializada, com catálogo técnico minucioso, galeria com até 5 imagens por equipamento, favoritos, avaliações reais de outros pilotos, múltiplos endereços com definição de endereço principal e checkout seguro com cálculo de promoções ativas e suporte a PIX e Cartão de Crédito.
- **Para os Administradores**: Painel de controle completo para governança de marcas e modelos (garantindo integridade de catálogo), gestão de fornecedores homologados, campanhas promocionais temporais e controle de estoque atômico com baixa na compra e estorno automático em cancelamentos.

---

## Funcionalidades

- **Vitrine e Catálogo Especializado**: Listagem com paginação e busca por nome, marca, modelo, câmera vinculada e faixa de preço, exibindo especificações técnicas completas e galeria com até 5 imagens por produto.
- **Gestão Administrativa Completa (Admin)**: Painéis com CRUDs protegidos e validação de integridade referencial para Drones, Câmeras, Marcas, Modelos, Fornecedores e Administradores.
- **Campanhas Promocionais Dinâmicas**: Cadastro de promoções com percentual de desconto e período de vigência, refletindo automaticamente no cálculo de preços da vitrine e do pedido.
- **Controle Atômico de Estoque**: Reserva e baixa imediata de estoque na criação do pedido, com estorno transacional automático em caso de cancelamento.
- **Snapshot Imutável de Endereço**: Gravação estática dos dados de entrega no ato do fechamento do pedido, protegendo o histórico fiscal e logístico contra edições cadastrais posteriores do cliente.
- **Pagamentos Polimórficos**: Suporte a PIX (com geração de chave UUID e dados de pagamento) e Cartão de Crédito via modelagem polimórfica relacional com herança JPA.
- **Autenticação e Autorização Stateless (RBAC)**: Autenticação via SmallRye JWT assinado com par de chaves assimétricas RSA (SHA-256), controle de perfis (`CLIENTE` e `ADMIN`), senhas com hash BCrypt e recuperação de conta por e-mail com token temporário.
- **Experiência do Usuário (Cliente)**: Sistema de lista de favoritos, avaliações com nota (1 a 5 estrelas) e comentários em produtos adquiridos, gerenciador de múltiplos endereços e painel de pedidos.

---

## Tecnologias

### Backend
- **Linguagem & Runtime**: [Java 25](https://openjdk.org/)
- **Framework Principal**: [Quarkus 3.32](https://quarkus.io/) (Supersonic Subatomic Java)
- **Persistência & ORM**: Hibernate ORM com Panache e PostgreSQL JDBC Driver
- **Camada REST & Validação**: Quarkus REST (Jackson), Hibernate Validator com validações customizadas (ex: `@CNPJ`) e SmallRye OpenAPI (Swagger UI)
- **Segurança**: SmallRye JWT com chaves assimétricas RSA (`privateKey.pem` / `publicKey.pem`) e BCrypt (`jbcrypt`)
- **Comunicação & Tarefas**: Quarkus Mailer (integração Mailtrap para recuperação de senha) e Quarkus Scheduler
- **Testes**: JUnit 5, RestAssured, Mockito e Quarkus Security Test

### Frontend
- **Framework SPA**: [Angular 22](https://angular.dev/) (Standalone Components, Signals e novos blocos de controle de fluxo `@if`, `@for`)
- **Linguagem**: [TypeScript ~6.0](https://www.typescriptlang.org/)
- **Componentes de UI**: Angular Material 22 & Angular CDK (tabelas, modais, formulários reativos e paginação)
- **Estilização**: Tailwind CSS 4 com utilitários responsivos
- **Gerenciamento Assíncrono**: RxJS 7.8 e Signals reativos
- **Testes**: Vitest com JSDOM

### Banco de Dados & Infraestrutura
- **Banco de Dados**: [PostgreSQL 16](https://www.postgresql.org/)
- **Carga Inicial**: Script SQL de semente de dados (`backend/src/main/resources/import.sql`)

---

## Como Executar

### Pré-requisitos
- **Java 25** (JDK) instalado e configurado no `PATH`.
- **Node.js** (versão 20+) e **npm** instalados.
- **PostgreSQL** instalado localmente ou via **Docker**.

---

### 1. Banco de Dados (PostgreSQL)

Certifique-se de que o PostgreSQL esteja em execução na porta `5432` com uma base de dados chamada `dronesDb`.

**Opção via Docker:**
```bash
docker run --name postgres-drones \
  -e POSTGRES_DB=dronesDb \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=123456 \
  -p 5432:5432 \
  -d postgres:16-alpine
```

Caso utilize PostgreSQL local, certifique-se de que o usuário seja `postgres`, a senha `123456` e a base `dronesDb` (ou configure os parâmetros correspondentes em `backend/src/main/resources/application.properties`).

---

### 2. Backend (Quarkus)

No diretório raiz do projeto, navegue até a pasta `backend` e inicie o modo de desenvolvimento:

```bash
cd backend
./mvnw quarkus:dev
```

- A API REST estará acessível em: `http://localhost:8080`
- O Swagger UI / OpenAPI estará acessível em: `http://localhost:8080/q/swagger-ui/`
- Na inicialização, o banco de dados é inicializado automaticamente com os dados do script `import.sql`.

---

### 3. Frontend (Angular)

Em outro terminal, a partir da raiz do projeto, navegue até a pasta `frontend`, instale as dependências e inicie o servidor:

```bash
cd frontend
npm install
npm start
```

- O frontend estará disponível em: `http://localhost:4200`

---

## Testes

### Executando Testes do Backend

Os testes unitários e de integração do backend são executados via Maven:

```bash
cd backend
./mvnw test
```

### Executando Testes do Frontend

A suíte de testes do frontend utiliza Vitest integrado ao Angular CLI:

```bash
cd frontend
npm test
```

---

## Como a IA foi Utilizada

A inteligência artificial foi empregada de forma **estritamente operacional e de suporte ao desenvolvimento**. A dupla de desenvolvedores manteve total controle sobre a concepção arquitetural: fomos nós que modelamos as entidades e relacionamentos do domínio no backend, definimos os contratos de API e idealizamos a experiência de uso e o design visual do frontend.

- **Onde a IA ajudou**:
  - Serviu como um acelerador de código para materializar a arquitetura planejada, agilizando a criação de classes repetitivas e componentes já estruturados pela equipe (entidades JPA, repositórios Panache, DTOs Records, Mappers, Resources REST e componentes standalone em Angular 22).
  - Auxiliou na padronização de documentação técnica viva e diagramas PlantUML a partir das decisões tomadas pela dupla.
- **Onde a IA errou / alucinou**:
  - **Inclusão de propriedades redundantes**: A IA insistiu na criação de campos desnecessários e duplicados nos modelos e DTOs, como manter `marcaId` e `modeloId` mesmo quando o objeto associado e seu mapeamento relacional já supriam a necessidade de forma limpa.
  - **Inconsistências de ecossistema**: Em alguns momentos gerou sugestões com sintaxes legadas ou incompatíveis com as novidades do Angular 22 e Quarkus com Java 25.
- **O que foi alterado e corrigido manualmente**:
  - Refatoração minuciosa de DTOs e modelos para eliminar os campos redundantes (`marcaId`/`modeloId`) em prol de uma modelagem enxuta e coesa.
  - Correção manual de layouts, validações de negócio (como checagem de vínculo entre Marca e Modelo) e resolução de conflitos de merge na consolidação do monorepo.

---

## O que Aprendemos

O desenvolvimento deste e-commerce trouxe lições técnicas e de engenharia de software fundamentais para a equipe:

1. **Decisão Arquitetural do Quarkus + Java 25**:
   - Optar por Quarkus ao invés do clássico ecossistema Spring Boot provou ser um acerto técnico expressivo: inicialização instantânea, baixo consumo de memória, facilidade de live reload no modo de desenvolvimento e integração nativa com Hibernate Panache.
2. **Isolamento de Contratos e Integridade de Domínio**:
   - A separação rigorosa entre Entidades JPA e DTOs (Records) evitou acoplamento da API ao banco de dados e vazamento de dados sensíveis.
   - A técnica de **snapshot imutável de endereço no momento da compra** foi um aprendizado prático crucial: alterar o cadastro de endereços do cliente não pode, sob hipótese alguma, alterar os registros de entregas de pedidos antigos.
3. **Desafios de Integração em Monorepo**:
   - Integrar os repositórios de backend e frontend em um único monorepo após ciclos de desenvolvimento paralelo exigiu atenção redobrada na resolução de conflitos de merge e no alinhamento contínuo dos contratos HTTP.
4. **O que Faríamos Diferente**:
   - **TDD (Test-Driven Development) desde o primeiro dia**: Teríamos estruturado a suíte de testes automatizados (unitários e de integração) logo no início das primeiras entidades e endpoints, economizando tempo em validações manuais e prevenindo regressões.
   - **Monorepo planejado desde a concepção**: Adotar a estrutura monorepo desde o pontapé inicial do projeto teria evitado retrabalho na consolidação de branches, configurações de ambiente e merges de repositórios separados.
