# Checklist de Implementação e Revisão - Quarkus Backend

Utilize este checklist em duas ocasiões:
1. **Durante o planejamento e implementação** de novos recursos no backend.
2. **Durante a revisão de código** (Code Review) para certificar a conformidade arquitetural e funcional.

---

## 📋 Fase 1: Pré-Voo e Inspeção Inicial

- [ ] **Inspeção do Código Existente**: O código atual em `backend/src/main/java/drones/` foi inspecionado para identificar classes, DTOs e serviços existentes relacionados à demanda?
- [ ] **Consulta a AGENTS.md e Docs de Domínio**: Foram lidos e assimilados:
  - `backend/AGENTS.md`
  - `docs/CONTEXTO_PROJETO.md`
  - `docs/REGRAS_NEGOCIO.md`
  - `docs/modelo.plantuml`
- [ ] **Alinhamento de Escopo**: O objetivo da tarefa está 100% claro sem assumir decisões de design pendentes?
- [ ] **Zero Invenção de Endpoints ou Regras**: A funcionalidade implementa exatamente o solicitado, sem novos campos ou rotas não acordadas?

---

## 🏗️ Fase 2: Arquitetura em Camadas e Contratos

- [ ] **Cadeia de Chamadas**: O fluxo respeita `Resource -> ServiceInterface -> ServiceImpl -> Repository -> Entity`?
- [ ] **Contratos DTO**:
  - DTOs de entrada e saída foram criados como `record` dentro do subpacote do domínio em `drones.dto.*`?
  - DTOs de entrada possuem validações declarativas (`@NotBlank`, `@NotNull`, `@Min`, etc.)?
  - DTOs de saída não expõem senhas, hashes, chaves privadas ou dados de auditoria irrelevantes?
- [ ] **Proibição de Vazamento de Entidades**:
  - **Nenhuma** entidade JPA é retornada diretamente no Resource?
  - Todo retorno é convertido via método estático da classe `*Mapper`?
- [ ] **Paginação**: Endpoints que retornam coleções utilizam `PageResponse<T>` com os metadados de paginação calculados corretamente?
- [ ] **Status HTTP**: O controller retorna status semânticos adequados (`201 Created` para inserções, `204 No Content` para exclusões/ações vazias, `200 OK` para consultas)?

---

## 💼 Fase 3: Regras de Negócio e Transações

- [ ] **Localização das Regras**: Todas as validações e cálculos de negócio residem exclusivamente na camada de Service (`*Service.java`)?
- [ ] **Transacionalidade**: Todo método de escrita/alteração no banco possui anotação `@Transactional`?
- [ ] **Tratamento de Exceções**:
  - Violações de negócio lançam `ValidationException("mensagem", "campo")`?
  - Recursos não encontrados disparam `NotFoundException`?
  - Não há blocos `catch` genéricos engolindo erros sem rollback?
- [ ] **Integridade Relacional**:
  - Validações de domínio foram respeitadas (ex: Drone/Câmera validar se Modelo pertence à Marca informada; limite de 5 fotos por drone; baixa/estorno de estoque atômicos)?

---

## 🔒 Fase 4: Segurança, Autorização e Isolamento

- [ ] **Proteção de Rotas**: Endpoints administrativos possuem `@RolesAllowed("ADMIN")`?
- [ ] **Identificação Segura**: A identidade do usuário logado é extraída de `jwt.getName()` injetado via SmallRye JWT?
- [ ] **Isolamento de Tenants/Usuários (Anti-IDOR)**:
  - Não há confiança cega em IDs de cliente vindos do frontend?
  - O Service valida se o recurso pertence ao usuário autenticado antes de consultar, alterar ou cancelar?
- [ ] **Consultas com Bind Parameters**: Todas as consultas HQL/Panache utilizam parâmetros nomeados (`:nome`) ou posicionais (`?1`), evitando SQL Injection?
- [ ] **Proteção de Senhas e Cartões**:
  - Senhas são criptografadas com BCrypt antes de persistir?
  - CVV de cartão de crédito não é armazenado no banco?

---

## 🧪 Fase 5: Compilação, Testes e Evidências

- [ ] **Compilação Java 25**:
  - Executado a partir de `backend/`:
    ```bash
    ./mvnw compile
    ```
  - Compilou com código de saída 0 sem warnings críticos?
- [ ] **Execução de Testes**:
  - Executado:
    ```bash
    ./mvnw test
    ```
  - Todos os testes passaram com sucesso?
- [ ] **Registro de Evidências**:
  - O resumo das execuções de compilação e testes foi registrado e apresentado na resposta ao usuário?

---

## 📝 Fase 6: Sincronização da Documentação Viva

- [ ] **Regras de Negócio**: Se houve ajuste ou inclusão de regras, `docs/REGRAS_NEGOCIO.md` foi atualizado?
- [ ] **Modelo de Dados**: Se houve alteração de entidades, colunas ou relacionamentos, `docs/modelo.plantuml` e `backend/src/main/resources/import.sql` foram atualizados?
- [ ] **Status do Projeto**: O status da funcionalidade foi atualizado em `docs/CONTEXTO_PROJETO.md`?
