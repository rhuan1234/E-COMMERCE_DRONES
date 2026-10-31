# AGENTS.md - Diretrizes para Agentes de IA e Desenvolvedores

Bem-vindo ao repositório do **E-Commerce de Drones**. Este arquivo define as instruções mandatórias, arquitetura de referência e procedimentos operacionais para agentes autônomos de IA e desenvolvedores que atuam nesta base de código.

---

## ⚠️ Leitura Obrigatória Antes de Novas Implementações

Antes de planejar, codificar, refatorar ou realizar qualquer alteração neste projeto, **você DEVE consultar e assimilar os seguintes documentos fundamentais na pasta `docs/`**:

1. [**`docs/CONTEXTO_PROJETO.md`**](docs/CONTEXTO_PROJETO.md)
   - **Quando consultar**: Antes de qualquer tomada de decisão técnica ou funcional.
   - **Conteúdo**: Visão estratégica do e-commerce, stack tecnológica (Java 25, Quarkus 3.32, Angular 22, Tailwind CSS 4), decisões arquiteturais tomadas (DTOs, JWT assimétrico, snapshot de endereço de entrega, tratamento global de exceções), estado atual de implementação e roadmap de pendências.

2. [**`docs/REGRAS_NEGOCIO.md`**](docs/REGRAS_NEGOCIO.md)
   - **Quando consultar**: Antes de implementar novos endpoints, formulários, componentes de checkout, cálculos de preços ou fluxos de usuário.
   - **Conteúdo**: Regras de negócio de cada entidade, ciclo de vida do pedido (`PENDENTE` -> `PAGO` ou `CANCELADO`), baixa e devolução automática de estoque, promoções temporais, herança de pagamentos (PIX e Cartão), snapshot imutável de endereço, limites de upload de imagens (máx. 5) e validações com Bean Validation / Regex.

3. [**`docs/modelo.plantuml`**](docs/modelo.plantuml)
   - **Quando consultar**: Antes de alterar entidades JPA, tabelas de banco, migrations ou relacionamentos no backend.
   - **Conteúdo**: Diagrama de classes em sintaxe PlantUML detalhando todas as entidades, tipos primitivos e complexos, atributos privados, métodos de negócio relevantes e multiplicidades relacionais.

---

## 🔄 Regra de Ouro: Manutenção e Sincronização Contínua

> **IMPORTANTE**: A documentação deste projeto é **viva** e deve refletir a verdade exata do código-fonte.
>
> Sempre que qualquer modificação for realizada envolvendo:
> 1. **Domínio ou Regras de Negócio**: Atualize imediatamente [**`docs/REGRAS_NEGOCIO.md`**](docs/REGRAS_NEGOCIO.md).
> 2. **Modelo de Dados (Entidades, Atributos ou Relacionamentos)**: Atualize imediatamente [**`docs/modelo.plantuml`**](docs/modelo.plantuml).
> 3. **Progresso, Stack ou Decisões Arquiteturais**: Atualize o status ("Concluído" / "Pendências") e decisões em [**`docs/CONTEXTO_PROJETO.md`**](docs/CONTEXTO_PROJETO.md).

Nunca conclua uma tarefa deixando o código dessincronizado com os arquivos da pasta `docs/`.

---

## 🛠️ Guia Rápido de Execução e Desenvolvimento

### Estrutura do Monorepo
- `/backend`: API REST Quarkus (porta padrão `8080`) — veja [**`backend/AGENTS.md`**](backend/AGENTS.md) para diretrizes específicas de backend.
- `/frontend`: SPA Angular (porta padrão `4200`) — veja [**`frontend/AGENTS.md`**](frontend/AGENTS.md) para diretrizes específicas de frontend.
- `/docs`: Documentação técnica e arquitetural de referência.

### Backend (Quarkus)
- **Pré-requisitos**: JDK 25 e PostgreSQL rodando localmente na porta `5432` com database `dronesDb` (`usuario: postgres`, `senha: 123456`).
- **Modo Desenvolvimento**:
  ```bash
  cd backend
  ./mvnw quarkus:dev
  ```
- **Execução de Testes**:
  ```bash
  cd backend
  ./mvnw test
  ```
- **Swagger / OpenAPI**: Acessível em `http://localhost:8080/q/swagger-ui/` durante o dev mode.
- **Carga de Dados**: O arquivo `backend/src/main/resources/import.sql` é executado na inicialização para popular o banco de testes com dados de exemplo.

### Frontend (Angular 22)
- **Pré-requisitos**: Node.js 20+ e npm.
- **Instalação e Execução**:
  ```bash
  cd frontend
  npm install
  npm start # roda na porta 4200
  ```
- **Execução de Testes**:
  ```bash
  cd frontend
  npm test
  ```

---

## 📋 Padrões de Código e Convenções

1. **DTOs e Mappers**:
   - Nunca exponha entidades JPA diretamente nos Controllers REST.
   - Use sempre classes Record DTO (`*RequestDTO`, `*ResponseDTO`) e faça a conversão via `*Mapper`.
2. **Tratamento de Exceções**:
   - Utilize `ValidationException("mensagem", "campo")` para violações de regra de negócio, capturadas automaticamente por `ValidationExceptionMapper`.
3. **Segurança e Roles**:
   - Restrinja endpoints administrativos com `@RolesAllowed("ADMIN")`.
   - Endpoints do cliente devem usar `@RolesAllowed({"CLIENTE", "ADMIN"})` ou `@Authenticated`.
   - Obtenha o usuário logado via injeção de `JsonWebToken jwt` (`jwt.getName()`).
4. **Respostas da API**:
   - Respostas paginadas devem retornar `PageResponse<T>`.
   - Siga as diretrizes de payload unificado documentadas em `frontend/docs/backend-response.md`.
