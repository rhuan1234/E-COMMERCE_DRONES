---
name: persistencia-postgresql
description: Oriente o desenho, modelagem e alterações de persistência com PostgreSQL, Hibernate ORM, JPA, Panache Repository e Flyway. Use para criação ou modificação de entidades JPA, repositories Panache, consultas SQL/HQL, migrations versionadas, índices, constraints, transações ACID, isolamento entre tenants e controle de concorrência. Não use para tarefas puramente de interface frontend, endpoints REST sem impacto em banco ou pipelines de infraestrutura CI/CD.
---

# Persistência com PostgreSQL, Hibernate ORM e Flyway

Oriente qualquer modificação de persistência garantindo rigor de schema, integridade referencial, concorrência segura, atomicidade e alinhamento conceitual com as fontes de verdade do projeto.

---

## 1. Consulta Obrigatória às Fontes de Verdade (Etapa Mandatória)

Antes de propor, planejar ou codificar alterações de persistência, execute a leitura analítica das seguintes fontes no diretório `docs/` e na base de código:

1. **Regras de Negócio (`docs/REGRAS_NEGOCIO.md`)**:
   - Verifique ciclos de vida de entidades (ex: status de pedidos, fluxo de pagamentos), limites de dados, campos obrigatórios e comportamentos invariáveis.
2. **Contexto do Projeto (`docs/CONTEXTO_PROJETO.md`)**:
   - Verifique a stack ativa, decisões arquiteturais consolidadas, convenções de banco de dados e pendências de roadmap.
3. **Diagrama Conceitual de Dados (`docs/modelo.plantuml`)**:
   - Inspecione as entidades existentes, tipos primitivos, multiplicidades relacionais (`1..*`, `*..*`), heranças e composições.
4. **Entidades e Repositórios Existentes**:
   - Inspecione `backend/src/main/java/drones/model/`, `backend/src/main/java/drones/repository/` e a carga semente em `backend/src/main/resources/import.sql` para preservar o estilo arquitetural e nomes de tabelas/colunas.

---

## 2. Portão de Aprovação para Novas Decisões de Domínio

> [!IMPORTANT]
> **REGRA DE GOVERNANÇA**: É terminantemente proibido criar ou alterar entidades JPA, schema do banco de dados ou migrations Flyway **sem aprovação prévia do usuário** quando a alteração representar uma **nova decisão de domínio**, mudança de regras de negócio, introdução de novos modelos conceituais ou quebra de contratos de persistência pré-existentes.

Quando a demanda envolver uma nova decisão de domínio:
1. Apresente formalmente a proposta técnica ao usuário detalhando:
   - Motivação de negócio e impacto no modelo conceitual.
   - Novas tabelas/colunas propostas, tipos no PostgreSQL e restrições de integridade.
   - Relações com entidades existentes e estratégia de concorrência.
2. Solicite e aguarde a autorização explícita antes de gerar arquivos de migration, entidades ou repositórios.
3. Para alterações triviais ou correções de bugs que sigam integralmente o domínio já aprovado em `docs/modelo.plantuml` e `docs/REGRAS_NEGOCIO.md`, proceda com a implementação mantendo conformidade estrita com as diretrizes abaixo.

---

## 3. Padrão de Entidades e Mapeamento JPA

- **Atributos Estritamente Privados**: Todos os atributos da entidade devem ser declarados como `private`. Nunca utilize atributos públicos ou package-private.
- **Acessores Explícitos**: Crie métodos getters e setters explícitos em `camelCase`. Coleções (`List`, `Set`) não devem ter suas referências internas mutáveis expostas diretamente; forneça métodos de negócio (`adicionarItem`, `removerItem`) que gerenciem a integridade bidirecional.
- **Panache Repository Pattern**: Rejeite a herança direta de `PanacheEntity` (Active Record com campos públicos). As entidades devem ser POJOs limpos anotados com `@Entity`, com acesso exclusivo através de classes dedicadas anotadas com `@ApplicationScoped` implementando `PanacheRepository<T>`.
- **Identificadores e Sequências**: Utilize chaves numéricas `Long` com `@Id @GeneratedValue(strategy = GenerationType.IDENTITY)`.
- **Enums Seguros**: Toda coluna baseada em enumeração Java DEVE usar obrigatoriamente `@Enumerated(EnumType.STRING)`. O uso de `ORDINAL` é estritamente proibido.
- **Prevenção de N+1 e Carregamento Sob Demanda**: Configure `@ManyToOne` e `@OneToOne` com `fetch = FetchType.LAZY` explícito. Relacionamentos `@OneToMany` devem ser usados com moderação e associados a `orphanRemoval = true` apenas quando a entidade filha for dependente estrita do agregado.

Consulte [references/mapeamento-jpa-panache.md](references/mapeamento-jpa-panache.md) para detalhes de tipos e queries com o Panache.

---

## 4. Migrations Versionadas e Integridade de Schema (Flyway)

Toda evolução do schema de banco de dados deve ser gerenciada através de migrations SQL versionadas:

1. **Localização**: `backend/src/main/resources/db/migration/`.
2. **Nomenclatura**: `V<versao>__<descricao_em_snake_case>.sql` (ex: `V20261031120000__criar_tabela_drone.sql`).
3. **Imutabilidade**: Scripts comitados ou aplicados em banco são imutáveis. Ajustes posteriores exigem uma nova migration incremental.
4. **Integridade Referencial Completa**:
   - Declare nomes explícitos para todas as restrições: `pk_*` para chaves primárias, `fk_*` para chaves estrangeiras, `uk_*` para restrições de unicidade e `chk_*` para checagens de domínio.
   - Adote `ON DELETE RESTRICT` como política padrão para evitar exclusões acidentais em cascata. Use `CASCADE` exclusivamente para entidades puramente dependentes (ex: itens de um pedido).
5. **Índices de Performance no PostgreSQL**:
   - Crie índices B-tree em todas as colunas de chave estrangeira (`fk_*`) para acelerar junções e checagens de integridade.
   - Crie índices parciais (filtered indexes) para estados de alta seletividade (ex: pedidos pendentes).
   - Use índices com funções (ex: `LOWER(nome)`) para dar suporte a consultas case-insensitive com `ILIKE`.

Consulte [references/flyway-migrations-postgresql.md](references/flyway-migrations-postgresql.md) para sintaxe DDL de referência e gerenciamento de evolução de schema.

---

## 5. Isolamento entre Tenants e Prevenção de Relações Cruzadas

Em cenários com segregação multi-tenant por discriminador:

1. **Tenant Obrigatório**:
   - Toda tabela e entidade com dados segregados deve conter a coluna `tenant_id` (`BIGINT NOT NULL`), mapeada na JPA como `updatable = false`.
2. **Prevenção Física de Relações Cruzadas (Cross-Tenant)**:
   - Crie chaves únicas compostas `UNIQUE (tenant_id, id)` e foreign keys compostas `FOREIGN KEY (tenant_id, associado_id) REFERENCES tabela_pai(tenant_id, id)`. Isso garante que o próprio PostgreSQL impeça que um registro aponte para um recurso de outro tenant.
3. **Filtro Mandatório em Repositórios e Services**:
   - Todas as operações de leitura, atualização e deleção em `PanacheRepository` devem conter o filtro explícito pelo tenant autenticado.
   - O Service deve validar a posse do tenant antes de qualquer vinculação ou operação de escrita.

Consulte [references/multitenancy-e-concorrencia.md](references/multitenancy-e-concorrencia.md) para estratégias completas de isolamento multi-tenant.

---

## 6. Atomicidade, Transações e Controle de Concorrência

1. **Atomicidade e Transacionalidade**:
   - Todo método de escrita, atualização ou exclusão na camada de serviço deve ser anotado com `@Transactional` (`jakarta.transaction.Transactional`).
   - Controllers REST nunca devem conter `@Transactional`.
   - Transações que realizam múltiplas mutações (ex: debitar estoque e gerar pedido com snapshot) devem ser atômicas; falhas de regra devem disparar rollback via `RuntimeException` / `ValidationException`.
2. **Controle de Concorrência Otimista**:
   - Aplique `@Version private Long versao;` nas entidades para proteger atualizações concorrentes, prevenindo anomalias de escrita perdida (*lost update*).
3. **Controle de Concorrência Pessimista**:
   - Para operações críticas de disputa sobre recursos limitados (ex: reserva e baixa de estoque de drones, pagamentos), execute bloqueio explícito via `findById(id, LockModeType.PESSIMISTIC_WRITE)` (`SELECT ... FOR UPDATE`).
4. **Prevenção de Deadlocks**:
   - Ordene deterministicamente os identificadores (ordem crescente de IDs) antes de adquirir múltiplos locks na mesma transação.

Consulte [references/multitenancy-e-concorrencia.md](references/multitenancy-e-concorrencia.md) para padrões de concorrência e exemplos de implementação.

---

## 7. Checklist de Verificação e Sincronização Obrigatória

Ao concluir qualquer alteração de persistência, execute esta checagem:

- [ ] As fontes de verdade (`docs/REGRAS_NEGOCIO.md`, `docs/modelo.plantuml`, `docs/CONTEXTO_PROJETO.md`) foram consultadas antes de iniciar?
- [ ] Mudanças conceituais de domínio foram formalmente aprovadas antes de codificar?
- [ ] Todos os atributos das entidades são `private`, com acessores explícitos e sem expor coleções mutáveis?
- [ ] O padrão `PanacheRepository<T>` foi utilizado (sem Active Record com campos públicos)?
- [ ] As migrations do Flyway contêm DDL transacional, com restrições e índices nomeados formalmente?
- [ ] As regras de integridade multi-tenant e prevenção de relações cruzadas foram respeitadas?
- [ ] As operações de escrita estão encapsuladas em `@Transactional`, com tratamento de concorrência (otimista/pessimista)?
- [ ] A documentação viva foi atualizada: `docs/modelo.plantuml`, `docs/REGRAS_NEGOCIO.md`, `docs/CONTEXTO_PROJETO.md` e sementes em `import.sql`?
