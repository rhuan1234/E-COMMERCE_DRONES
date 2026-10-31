# Migrations SQL Versionadas com Flyway no PostgreSQL

Este documento estabelece as diretrizes para criação, evolução e governança de migrations SQL com Flyway e PostgreSQL.

---

## 1. Convenção e Localização de Arquivos

No ecossistema Quarkus, os scripts Flyway ficam localizados em:
`backend/src/main/resources/db/migration/`

### 1.1 Formato do Nome de Arquivo
```
V<Versao>__<Descricao_com_snake_case>.sql
```

- **Prefixo**: `V` maiúsculo para migrations versionadas regulares.
- **Versão**:
  - Incremental sequencial: `V1.0.0__...`, `V1.0.1__...`, `V2.0.0__...`
  - Timestamp ISO/UTC (recomendado para equipes paralelas): `V20261031100000__criar_tabela_drone.sql`
- **Separador**: Dois underscores obrigatórios (`__`).
- **Descrição**: Em letras minúsculas com palavras separadas por underscore único, descrevendo com precisão o objetivo (ex: `adicionar_coluna_estoque_minimo_drone.sql`).
- **Extensão**: `.sql`.

> [!CAUTION]
> **Imutabilidade de Migrations**: Scripts de migration já executados em qualquer ambiente compartilhado ou comitados no branch principal **NUNCA** devem ser editados ou renomeados. Qualquer ajuste deve ser feito em uma nova migration subsequente.

---

## 2. Padrões de DDL no PostgreSQL

O PostgreSQL executa DDL dentro de transações de forma atômica. Se um comando falhar no meio do script, o Flyway aborta e realiza rollback completo.

### 2.1 Tipos de Dados Recomendados
- **Chaves Primárias**: `BIGINT GENERATED ALWAYS AS IDENTITY` (padrão SQL moderno) ou `BIGSERIAL`.
- **Textos**:
  - `VARCHAR(n)` quando houver limite de domínio justificado (ex: nomes, códigos, emails).
  - `TEXT` para descrições longas, observações e payloads.
- **Valores Monetários e Precisão Decimal**: `NUMERIC(15, 2)` ou `DECIMAL(19, 4)`. **Nunca use `FLOAT` ou `DOUBLE PRECISION` para valores monetários**.
- **Datas**: `TIMESTAMP WITH TIME ZONE` (ou `TIMESTAMPTZ`) para registros com ponto no tempo. `DATE` para datas puras sem horário.
- **Booleanos**: `BOOLEAN NOT NULL DEFAULT false` (ou `true`).
- **Identificadores UUID**: `UUID`.

---

## 3. Integridade Referencial e Nomenclatura de Restrições

Toda restrição de integridade no banco de dados deve receber um nome explícito, seguindo a convenção:

| Tipo de Restrição | Prefixo / Padrão | Exemplo |
| :--- | :--- | :--- |
| **Primary Key** | `pk_<tabela>` | `pk_drone`, `pk_item_pedido` |
| **Foreign Key** | `fk_<origem>_<destino>` | `fk_drone_marca`, `fk_item_pedido_drone` |
| **Unique Constraint** | `uk_<tabela>_<coluna(s)>` | `uk_usuario_email`, `uk_fornecedor_cnpj` |
| **Check Constraint** | `chk_<tabela>_<regra>` | `chk_drone_preco_positivo`, `chk_avaliacao_nota` |
| **Index** | `idx_<tabela>_<coluna(s)>` | `idx_drone_marca_id`, `idx_pedido_cliente_data` |

### 3.1 Exemplo Completo de Criação de Tabela
```sql
CREATE TABLE IF NOT EXISTS drone (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    nome VARCHAR(150) NOT NULL,
    preco NUMERIC(12, 2) NOT NULL,
    quantidade_disponivel INTEGER NOT NULL DEFAULT 0,
    marca_id BIGINT NOT NULL,
    modelo_id BIGINT NOT NULL,
    fornecedor_id BIGINT NOT NULL,
    versao BIGINT NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    data_cadastro TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_drone PRIMARY KEY (id),
    CONSTRAINT fk_drone_marca FOREIGN KEY (marca_id) REFERENCES marca(id) ON DELETE RESTRICT,
    CONSTRAINT fk_drone_modelo FOREIGN KEY (modelo_id) REFERENCES modelo(id) ON DELETE RESTRICT,
    CONSTRAINT fk_drone_fornecedor FOREIGN KEY (fornecedor_id) REFERENCES fornecedor(id) ON DELETE RESTRICT,
    CONSTRAINT chk_drone_preco_positivo CHECK (preco > 0),
    CONSTRAINT chk_drone_quantidade_nao_negativa CHECK (quantidade_disponivel >= 0)
);
```

---

## 4. Políticas de Deleção em Chaves Estrangeiras

- **`ON DELETE RESTRICT` (Padrão de Segurança)**: Use para entidades principais e relacionamentos mestres (ex: não permitir apagar uma `Marca` se houver `Drone` ou `Modelo` associado).
- **`ON DELETE CASCADE`**: Use **estritamente** para dependências fortes e agregados onde a entidade filha não tem existência própria fora do pai (ex: `item_pedido` ao deletar um rascunho de pedido, ou `drone_image` ao deletar um `drone`).
- **`ON DELETE SET NULL`**: Permitido apenas quando a coluna de relacionamento for opcional (`NULLable`) e a desvinculação mantiver o significado de negócio.

---

## 5. Estratégia de Índices no PostgreSQL

Crie índices apenas com base em padrões reais de consulta e filtros:

1. **Foreign Keys**: Toda coluna de chave estrangeira deve ter um índice B-tree associado para acelerar junções (`JOIN`) e evitar table scans em checagens de integridade referencial:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_drone_marca_id ON drone (marca_id);
   CREATE INDEX IF NOT EXISTS idx_drone_modelo_id ON drone (modelo_id);
   CREATE INDEX IF NOT EXISTS idx_drone_fornecedor_id ON drone (fornecedor_id);
   ```

2. **Índices Compostos**: Respeite a ordem das colunas no índice conforme o padrão de busca (igualdade primeiro, ordenação/faixa depois):
   ```sql
   CREATE INDEX IF NOT EXISTS idx_pedido_cliente_status ON pedido (cliente_id, status);
   ```

3. **Índices Parciais (Filtered Indexes)**: O PostgreSQL permite indexar subconjuntos de dados, economizando espaço em disco e acelerando consultas frequentes:
   ```sql
   -- Apenas pedidos que ainda exigem processamento
   CREATE INDEX IF NOT EXISTS idx_pedido_pendente_criacao 
   ON pedido (data_criacao) 
   WHERE status = 'PENDENTE';
   ```

4. **Buscas por Texto (Case-Insensitive)**:
   ```sql
   -- Para filtros com ILIKE ou lower(coluna)
   CREATE INDEX IF NOT EXISTS idx_drone_nome_lower ON drone (LOWER(nome));
   ```

---

## 6. Procedimento para Migrations de Alteração de Schema

Ao alterar tabelas existentes em produção/staging:
1. **Adição de Novas Colunas**: Se a coluna for `NOT NULL`, adicione primeiro com um valor padrão (`DEFAULT`) para evitar falha em linhas pré-existentes.
2. **Remoção ou Renomeação de Colunas**: Não renomeie nem remova colunas ativamente consumidas pelo backend em uma única etapa (risco de downtime). Use ciclo em duas etapas (adicionar nova coluna -> migrar dados -> depreciar -> remover em versão futura).
3. **Verificação de Locks**: Evite operações pesadas que bloqueiem tabelas em leitura/escrita por longos períodos em tabelas com grande volume de dados.
