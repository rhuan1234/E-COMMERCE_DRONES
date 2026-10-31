# Multi-Tenancy, Atomicidade e Controle de Concorrência

Este documento define os padrões mandatórios de isolamento entre tenants, prevenção de relações cruzadas, demarcação transacional e concorrência no PostgreSQL com Hibernate e Panache.

---

## 1. Isolamento entre Tenants (Multi-Tenancy)

Quando o domínio da aplicação adota segregação multi-tenant por discriminador de coluna (`discriminator column`), o isolamento deve ser estritamente garantido em todas as camadas: banco de dados, repositório e serviços.

### 1.1 Coluna de Tenant Obrigatória
- Toda entidade e tabela sujeita ao isolamento deve conter obrigatoriamente a coluna `tenant_id`:
  - No banco de dados: `tenant_id BIGINT NOT NULL` (ou `VARCHAR`/`UUID` conforme a convenção do sistema).
  - Na entidade JPA:
    ```java
    @Column(name = "tenant_id", nullable = false, updatable = false)
    private Long tenantId;
    ```
  - A coluna deve ser marcada como `updatable = false` para impedir que uma entidade migre de tenant após a sua criação.

### 1.2 Prevenção de Relações Cruzadas (Cross-Tenant Leakage)
O maior risco em arquiteturas multi-tenant é uma entidade pertencente ao Tenant A referenciar ou manipular dados do Tenant B.

#### A. Integridade Referencial no PostgreSQL com FKs Compostas
Para impedir fisicamente relações cruzadas no nível do banco de dados, utilize chaves únicas e chaves estrangeiras compostas contendo o `tenant_id`:

```sql
-- Tabela de filiais por tenant
CREATE TABLE IF NOT EXISTS filial (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    tenant_id BIGINT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    CONSTRAINT pk_filial PRIMARY KEY (id),
    CONSTRAINT uk_filial_tenant UNIQUE (tenant_id, id)
);

-- Tabela de estoque vinculada à filial
CREATE TABLE IF NOT EXISTS estoque_filial (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    tenant_id BIGINT NOT NULL,
    filial_id BIGINT NOT NULL,
    quantidade INT NOT NULL DEFAULT 0,
    CONSTRAINT pk_estoque_filial PRIMARY KEY (id),
    -- FK composta garante que filial_id pertença EXATAMENTE ao mesmo tenant_id:
    CONSTRAINT fk_estoque_filial_tenant 
        FOREIGN KEY (tenant_id, filial_id) 
        REFERENCES filial(tenant_id, id) 
        ON DELETE RESTRICT
);
```

#### B. Isolamento Estrito nos Repositórios Panache
Todo método de busca, atualização ou exclusão deve filtrar explicitamente pelo tenant autenticado:

```java
@ApplicationScoped
public class PedidoRepository implements PanacheRepository<Pedido> {

    public Optional<Pedido> findByIdAndTenant(Long id, Long tenantId) {
        return find("id = ?1 and tenantId = ?2", id, tenantId).firstResultOptional();
    }

    public PanacheQuery<Pedido> listByTenant(Long tenantId) {
        return find("tenantId = ?1 order by dataCriacao desc", tenantId);
    }

    public long deleteByIdAndTenant(Long id, Long tenantId) {
        return delete("id = ?1 and tenantId = ?2", id, tenantId);
    }
}
```

#### C. Validação de Fronteira no Service
Antes de vincular qualquer entidade relacionada (ex: vincular um `Cliente` a um `Pedido`), valide explicitamente no Service se a entidade associada pertence ao mesmo `tenantId`. Se divergente, lance `ValidationException("Recurso associado não pertence à organização solicitante", "tenantId")`.

---

## 2. Atomicidade e Demarcação Transacional

1. **Anotação `@Transactional`**:
   - Métodos de escrita, atualização ou deleção nos Services devem ser demarcados com `@Transactional` (`jakarta.transaction.Transactional`).
   - Controllers REST **NUNCA** devem conter `@Transactional` diretamente; a demarcação transacional pertence à camada de serviço.
   - Métodos somente de leitura não necessitam de transação ativa de escrita, reduzindo o tempo de retenção de conexões no pool do HikariCP.

2. **Rollback Automático e Exceções**:
   - O Quarkus/JTA realiza rollback automático para qualquer `RuntimeException` (como `ValidationException` ou `OptimisticLockException`).
   - Nunca capture exceções com blocos `try-catch` vazios dentro de métodos `@Transactional`, pois isso silencia o erro e comita dados corrompidos.

3. **Operações Atômicas de Negócio**:
   - Exemplo clássico: **Criação de Pedido com Reserva de Estoque**.
     - A reserva/baixa do estoque e a persistência do pedido com snapshot de endereço devem ocorrer dentro da mesma transação atômica. Se a validação de estoque falhar para qualquer item, nenhum registro deve ser gravado.

---

## 3. Controle de Concorrência

Operações concorrentes sobre os mesmos dados sem proteção adequada geram inconsistências graves (lost updates, overselling de estoque, dupla cobrança).

### 3.1 Concorrência Otimista (`@Version`)
Indicada para a grande maioria das entidades onde conflitos concorrentes são ocasionais (ex: atualização cadastral de produtos, fornecedores, clientes).

- **Como implementar**:
  - Adicione o atributo com `@Version`:
    ```java
    @Version
    @Column(name = "versao", nullable = false)
    private Long versao;
    ```
  - No banco de dados: `versao BIGINT NOT NULL DEFAULT 0`.
- **Comportamento**: O Hibernate inclui `WHERE id = ? AND versao = ?` no `UPDATE`. Se outro processo alterou o registro antes, uma `OptimisticLockException` é lançada.
- **Tratamento**: Capture e mapeie para status HTTP 409 Conflict ou oriente retentativa.

### 3.2 Concorrência Pessimista (`LockModeType.PESSIMISTIC_WRITE`)
Indicada para operações de alta criticidade e concorrência acirrada sobre recursos escassos (ex: **reserva de estoque**, **estorno de saldo**, **concorrência de cupons promocionais com limite de uso**).

- **Como implementar no Repositório**:
  ```java
  public Drone findByIdForUpdate(Long id) {
      return findById(id, LockModeType.PESSIMISTIC_WRITE);
  }
  ```
- **Efeito no PostgreSQL**: O Hibernate executa `SELECT ... FOR UPDATE`, adquirindo um lock exclusivo na linha da tabela até o fim da transação (`COMMIT` ou `ROLLBACK`). Outras transações que tentarem ler com `FOR UPDATE` ou alterar a mesma linha aguardarão em fila.

### 3.3 Prevenção de Deadlocks
Quando uma operação precisa bloquear múltiplos registros concorrentemente (ex: compra de vários itens de estoque em um único pedido):

- **Regra de Ouro**: Adquira os locks sempre na mesma ordem determinística em todos os fluxos da aplicação.
- **Procedimento**:
  1. Ordene os IDs dos produtos em ordem crescente antes de chamar `findByIdForUpdate`:
     ```java
     List<Long> droneIdsOrdenados = itens.stream()
             .map(ItemDTO::getDroneId)
             .sorted()
             .toList();

     for (Long id : droneIdsOrdenados) {
         Drone drone = droneRepository.findByIdForUpdate(id);
         // Atualiza estoque com segurança...
     }
     ```
  2. Isso elimina ciclos de dependência cruzada entre transações paralelas (Transação A travando 1 depois 2, e Transação B travando 2 depois 1), prevenindo deadlocks no PostgreSQL.
