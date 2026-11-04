# Contexto do Projeto - E-Commerce de Drones

Este documento consolida a visão estratégica, arquitetura de software, stack tecnológica, estado atual de implementação e roadmap de pendências do projeto **E-Commerce de Drones**.

---

## 1. Visão do Projeto

O **E-Commerce de Drones** é uma solução completa para comércio eletrônico de veículos aéreos não tripulados (drones), sensores e câmeras de alta precisão, peças e acessórios voltados tanto para o público entusiasta/cinematográfico quanto profissional e industrial.

O sistema atende a dois perfis principais de usuários:
1. **Administrador (`ADMIN`)**:
   - Controle total do catálogo de produtos (Drones, Marcas, Modelos, Câmeras).
   - Gestão de fornecedores parceiros e estoque de produtos.
   - Configuração de campanhas promocionais com descontos percentuais e controle de vigência.
   - Supervisão e análise de pedidos de clientes e pagamentos realizados.
   - Gestão de usuários administrativos.
2. **Cliente (`CLIENTE`)**:
   - Cadastro e autenticação segura na plataforma.
   - Visualização do catálogo de produtos com galeria de imagens, especificações técnicas detalhadas e preços promocionais.
   - Avaliação de produtos comprados e gestão de lista de favoritos.
   - Gestão de múltiplos endereços de entrega com seleção de endereço principal.
   - Montagem de pedidos e realização de pagamento via PIX ou Cartão de Crédito.
   - Consulta de histórico de pedidos e cancelamento com estorno automático de estoque.

---

## 2. Estrutura do Repositório (Monorepo)

O projeto é estruturado em um monorepo contendo backend e frontend desacoplados:

```
E-COMMERCE_DRONES/
├── AGENTS.md                 # Diretrizes para agentes de IA e desenvolvedores
├── docs/                     # Documentação viva do projeto
│   ├── CONTEXTO_PROJETO.md   # Visão, stack, arquitetura, progresso e roadmap
│   ├── REGRAS_NEGOCIO.md     # Entidades, validações, fluxos e regras de negócio
│   └── modelo.plantuml       # Diagrama PlantUML do modelo de dados
├── backend/                  # API REST em Quarkus / Java 25
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/drones/  # Controllers, Services, Repositories, DTOs, Mappers, Models
│   │   │   └── resources/    # application.properties, import.sql (seed), chaves JWT
│   │   └── test/             # Testes automatizados (JUnit 5, RestAssured)
│   ├── uploads/              # Armazenamento local de imagens de drones
│   └── pom.xml               # Gerenciador de dependências Maven
└── frontend/                 # SPA em Angular v22 com Tailwind CSS e Angular Material
    ├── src/
    │   ├── app/
    │   │   ├── core/         # Models, Services HTTP, Resolvers, Guards de Autenticação
    │   │   ├── features/     # Módulos funcionais (admin, ecommerce, auth)
    │   │   └── shared/       # Componentes reutilizáveis (dialogs, paginadores)
    │   └── styles.css        # Configurações globais e tema Tailwind/Material
    └── package.json          # Dependências npm
```

---

## 3. Stack Tecnológica

### Backend
- **Linguagem & Runtime**: Java 25 (OpenJDK).
- **Framework Principal**: [Quarkus](https://quarkus.io/) v3.32.4.
- **Camada REST & OpenAPI**: Quarkus REST (`quarkus-rest`, `quarkus-rest-jackson`) e SmallRye OpenAPI (`quarkus-smallrye-openapi` / Swagger UI).
- **Persistência**: Hibernate ORM com Panache (`quarkus-hibernate-orm-panache`), utilizando PostgreSQL (`quarkus-jdbc-postgresql`).
- **Validação de Dados**: Hibernate Validator (`quarkus-hibernate-validator` com anotações padrão e customizadas como `@CNPJ`).
- **Segurança & Criptografia**: SmallRye JWT (`quarkus-smallrye-jwt`) com assinatura de chaves assimétricas RSA (`publicKey.pem` e `privateKey.pem`) e hash de senhas com BCrypt (`jbcrypt` 0.4).
- **Comunicação / Notificações**: Quarkus Mailer (`quarkus-mailer`), configurado para envio de emails transacionais (recuperação de senhas via Mailtrap).
- **Agendamento**: Quarkus Scheduler (`quarkus-scheduler`) para tarefas recorrentes de background.
- **Armazenamento de Mídia**: Serviço local de upload com hash UUID em disco (`backend/uploads/`).
- **Testes**: JUnit 5, Quarkus Test Security, RestAssured e Mockito.

### Frontend
- **Framework SPA**: [Angular](https://angular.dev/) v22.1.
- **Linguagem**: TypeScript ~6.0.
- **Componentes de UI**: Angular Material v22 (`@angular/material`, `@angular/cdk`) para modais, tabelas, formulários, autocomplete e paginação.
- **Estilização**: Tailwind CSS v4 (`@tailwindcss/postcss`) para design responsivo e utilitários modernos.
- **Gerenciamento Assíncrono**: RxJS 7.8 e Signals do Angular.
- **Roteamento**: Angular Router com roteamento desacoplado, guards funcionais (`authGuard`) e resolvers (`DroneResolver`, `FornecedorResolver`, etc.).
- **Runner de Testes**: Vitest (`@vitest/runner`).

---

## 4. Decisões Arquiteturais Tomadas

1. **Separação Estrita de Contratos de API (DTOs)**:
   - Entidades JPA de banco de dados (`drones.model.*`) nunca são expostas diretamente nos endpoints REST.
   - Foram implementados DTOs específicos de entrada (`*RequestDTO`) e saída (`*ResponseDTO`), garantindo versionamento seguro e impedindo vazamento de dados sensíveis (senhas, dados internos).
   - O mapeamento entre DTOs e entidades é isolado em classes `*Mapper` dedicadas.

2. **Tratamento Centralizado de Exceções**:
   - Criação de mappers JAX-RS para captura global de exceções:
     - `ValidationExceptionMapper`: intercepta `ValidationException` de negócio e retorna HTTP 400 estruturado com lista de campos e mensagens.
     - `ConstraintViolationExceptionMapper`: intercepta validações automáticas do Hibernate Validator.
     - `NotFoundExceptionMapper`: padroniza respostas HTTP 404.
     - `UnauthorizedExceptionMapper`: garante padronização para HTTP 401.
     - `OptimisticLockExceptionMapper`: protege concorrência e integridade transacional.

3. **Padronização das Respostas JSON**:
   - Respostas de sucesso seguem `{ success: true, data: ..., message: ... }`.
   - Listagens paginadas utilizam o encapsulador `PageResponse<T>` com metadados `{ page, pageSize, totalItems, totalPages }`.
   - Respostas de erro utilizam formato padronizado `{ success: false, message: ..., error: { code, details } }`.

4. **Autenticação Stateless com JWT Assimétrico**:
   - O backend emite tokens assinados com chave privada RSA (`privateKey.pem`).
   - As rotas protegidas validam o token utilizando a chave pública RSA (`publicKey.pem`).
   - Perfis de acesso baseados em Role (`@RolesAllowed({"ADMIN", "CLIENTE"})`).

5. **Integridade Relacional do Domínio de Catálogo**:
   - As entidades `Marca` e `Modelo` foram separadas em tabelas relacionais próprias para evitar inconsistências de digitação.
   - Ao cadastrar um `Drone` ou `Camera`, valida-se no service se o `Modelo` selecionado pertence de fato à `Marca` informada.

6. **Snapshot Imutável de Endereço no Pedido**:
   - Quando um pedido é gerado, os dados do endereço principal do cliente no momento da compra são gravados diretamente nas colunas `ruaEntrega`, `bairroEntrega`, `cidadeEntrega`, `estadoEntrega` e `cepEntrega` da tabela `pedido`.
   - Isso garante que alterações posteriores no cadastro de endereços do cliente não distorçam o histórico fiscal e logístico de pedidos já realizados.

7. **Estratégia de Herança para Pagamentos**:
   - Utilização de `@Inheritance(strategy = InheritanceType.JOINED)` na entidade abstrata `Pagamento`, com as especializações `PagamentoPix` e `PagamentoCartao`.
   - Permite consultas polimórficas mantendo os dados específicos de cada método em tabelas normalizadas.

8. **Controle Estrito de Estoque**:
   - Criação de pedido reserva/baixa estoque imediatamente.
   - Cancelamento de pedido (seja por cliente ou admin) estorna as quantidades correspondentes de volta ao estoque do drone de forma atômica (`@Transactional`).

9. **Governança e Padronização Backend (Skill `quarkus-backend`)**:
   - Implantação da skill `.agents/skills/quarkus-backend` para orientar a implementação e revisão em camadas (`Resource -> Service -> Repository -> Entity`), DTOs imutáveis via Records, blindagem contra IDOR, isolamento de usuários e proibição de vazamento de entidades JPA.

10. **Padrão de Persistência, Schema e Concorrência (Skill `persistencia-postgresql`)**:
    - Implantação da skill `.agents/skills/persistencia-postgresql` para governança de entidades JPA (atributos privados e acessores explícitos), repositórios Panache com queries parametrizadas, migrations SQL versionadas via Flyway, restrições e integridade referencial, isolamento entre tenants (prevenção de relações cruzadas) e controle de concorrência (otimista via `@Version` e pessimista via `FOR UPDATE`).
    - Exigência de portão de aprovação formal para qualquer alteração que represente nova decisão de domínio.

11. **Padrão e Governança de Frontend Standalone (Skill `angular-frontend`)**:
    - Implantação da skill `.agents/skills/angular-frontend` para governança da arquitetura Angular standalone, novos controles de fluxo (`@if`, `@for`, `@switch`), Signals, formulários reativos tipados, validações de domínio brasileiro (CPF, CNPJ, CEP), serviços HTTP sem criação de endpoints ou campos inventados, autenticação JWT com interceptor, guards de rota, tratamento estrito dos 4 estados de UI (Loading, Success, Empty, Error) e verificação de integridade via build de produção.

12. **Governança de Testes Frontend e Validação Comportamental (Skill `testes-frontend`)**:
    - Implantação da skill `.agents/skills/testes-frontend` para orientar a criação, revisão, execução e auditoria de testes unitários e de integração no Angular 22 com Vitest e JSDOM.
    - Foco em comportamento observável (matriz das 12 dimensões: renderização, interação, validações, chamadas HTTP, fluxos de sucesso, fluxos de erro 400/500, loading, empty state, navegação, autorização/guards, sessão 401 e prevenção de envio duplicado).
    - Exigência estrita de comprovação com evidência real de terminal, proibindo declarações nominais de aprovação ou cobertura sem logs concretos.

---

## 5. Estado Atual de Implementação

### Backend (Concluído)
- [x] Arquitetura base Quarkus com Hibernate Panache configurada.
- [x] Governança e diretrizes de desenvolvimento padronizadas via skill `quarkus-backend`.
- [x] Governança e padronização de persistência PostgreSQL/JPA/Flyway via skill `persistencia-postgresql`.
- [x] Governança, arquitetura e execução obrigatória de testes automatizados via skill `testes-backend` (JUnit 5, REST Assured, PostgreSQL e concorrência).
- [x] Banco de dados PostgreSQL com script de carga inicial completo (`import.sql`).
- [x] Autenticação e Autorização via JWT (Login, geração e validação de token).
- [x] CRUD completo de Drones com filtros (nome, marca, modelo, faixa de preço, câmera).
- [x] Sistema de upload e gerenciamento de múltiplas imagens por drone (até 5 fotos, marcação de foto principal e ordenação).
- [x] CRUD de Marcas e Modelos com validação de integridade.
- [x] CRUD de Câmeras com especificações (resolução, zoom, fps, estabilização).
- [x] CRUD de Fornecedores com validação de CNPJ e endereço.
- [x] CRUD de Localidades (Estados e Cidades).
- [x] CRUD de Campanhas Promocionais com percentual e intervalo de vigência.
- [x] Gestão de Usuários: Administradores e Clientes.
- [x] Gestão de Endereços por Cliente com indicação de endereço principal.
- [x] Fluxo de alteração de senha autenticada e recuperação de senha ("Esqueci minha senha" via email com token temporário).
- [x] Criação de Pedidos com validação de estoque, aplicação dinâmica de promoção e snapshot de entrega.
- [x] Processamento de Pagamento polimórfico (PIX com chave UUID e Cartão de Crédito).
- [x] Cancelamento de pedidos com cancelamento de pagamento e estorno automático de estoque.
- [x] Módulo de Favoritos (adicionar, remover, listar favoritos por usuário).
- [x] Módulo de Avaliações de produtos (nota de 1 a 5 e comentários por produto e cliente).

### Frontend (Concluído)
- [x] Governança e diretrizes de desenvolvimento frontend padronizadas via skill `angular-frontend`.
- [x] Configuração inicial Angular 22, Tailwind CSS e Angular Material.
- [x] Layout Administrativo completo com menu lateral, cabeçalho e navegação.
- [x] Módulo de Autenticação: tela de Login e tela de Cadastro de Cliente (`Register`).
- [x] Painel Admin - Gestão de Drones: Listagem paginada, formulário reativo de criação/edição, modal de detalhes e modal de upload/gerenciamento de imagens.
- [x] Painel Admin - Gestão de Marcas: Listagem, filtros por nome, criação e edição.
- [x] Painel Admin - Gestão de Modelos: Listagem com marca vinculada, criação e edição.
- [x] Painel Admin - Gestão de Câmeras: Listagem com especificações, criação e edição.
- [x] Painel Admin - Gestão de Fornecedores: Listagem com detalhes de contato/CNPJ, criação e edição.
- [x] Painel Admin - Gestão de Administradores: Listagem e cadastro de novos usuários administradores.
- [x] Painel Admin - Gestão de Promoções: Listagem de promoções vigentes, criação e edição com cálculo de datas.
- [x] Painel Usuário: Página de Perfil, gerenciador de endereços e alteração de senha.
- [x] Vitrine E-commerce: Página Home inicial exibindo catálogo de drones em cards com fotos, especificações e preços.
- [x] Sistema de Favoritos no E-Commerce: adicionar/remover nos cards e página paginada "Meus Favoritos" integrada ao backend.
- [x] Página de detalhes de drones com galeria de imagens, ficha técnica e favoritos integrados.

---

## 6. Pendências e Próximos Passos (Roadmap)

### Frontend E-Commerce (Área Pública e do Cliente)
1. **Página de Detalhes do Produto**: galeria, ficha técnica e favorito concluídos; avaliações ainda pendentes.
2. **Sistema de Favoritos no E-Commerce**: concluído na Home e na página paginada "Meus Favoritos".
3. **Carrinho de Compras (Cart)**:
   - Estado gerenciado (Signals ou RxJS Subject) com persistência em `LocalStorage`.
   - Adição, remoção, alteração de quantidades e verificação prévia de estoque.
4. **Fluxo de Checkout**:
   - Seleção do endereço de entrega entre os cadastrados ou cadastro de um novo endereço.
   - Escolha da forma de pagamento:
     - **PIX**: exibição de QR Code e chave Pix Copia-e-Cola com botão de confirmação.
     - **Cartão de Crédito**: formulário de dados do titular, número, validade e CVV.
   - Finalização do pedido e direcionamento para página de sucesso.
5. **Histórico e Acompanhamento de Pedidos**:
   - Tela "Meus Pedidos" para o cliente autenticado acompanhar status (`PENDENTE`, `PAGO`, `CANCELADO`).
   - Botão para cancelar pedido pendente diretamente pelo cliente.
6. **Fluxo de Recuperação de Senha no Frontend**:
   - Telas públicas de "Esqueci minha senha" (envio de email) e "Redefinir senha" (inserção de token e nova senha).

### Backend (Melhorias Futuras)
1. **Cancelamento Automático de Pedidos Pendentes**:
   - Criação de rotina agendada via `@Scheduled` para cancelar pedidos pendentes sem pagamento após prazo estipulado (ex: 24h a 48h), liberando o estoque automaticamente.
2. **Integração Real com Gateway de Pagamento**:
   - Adição de webhook de notificação de pagamento para atualização em tempo real do status de transações bancárias.
3. **Storage de Produção para Imagens**:
   - Suporte a provedores de Object Storage (AWS S3, Google Cloud Storage ou MinIO) em substituição ao filesystem local.
4. **Ampliação da Cobertura de Testes Automatizados**:
   - Testes unitários e de integração adicionais para fluxos de checkout, concorrência de estoque e transações de pagamento.
