# Template: Relatório de Divergências (Diagrama vs. Código)

Este modelo deve ser utilizado pelo agente sempre que for identificada qualquer disparidade entre o diagrama PlantUML (`docs/modelo.plantuml`) e a implementação real no código ou banco de dados.

> [!WARNING]
> Nenhuma alteração em código ou migrations pode ser realizada sem aprovação prévia com base neste relatório.

---

## Estrutura do Relatório

### 1. Resumo Executivo
- **Data da Auditoria**: `YYYY-MM-DD`
- **Arquivo de Diagrama Analisado**: `docs/modelo.plantuml`
- **Módulos / Pacotes Avaliados**: `backend/src/main/java/.../model/`
- **Status Geral**: `[Conforme | Divergências Identificadas | Proposta Conceitual]`

### 2. Matriz de Divergências Identificadas

| Entidade / Relacionamento | Elemento | Modelo no Diagrama (PlantUML) | Implementação no Código / BD | Categoria | Impacto Potencial |
| :--- | :--- | :--- | :--- | :--- | :--- |
| *Ex: Drone* | Atributo `preco` | `BigDecimal` | `double` | Tipo de Dado | Alteração de precisão monetária e migração de schema |
| *Ex: DroneImage* | Cardinalidade | `"0..5"` | Sem limite em JPA (apenas regra no Service) | Validação / Cardinalidade | Documentação vs. regra em tempo de execução |
| *Ex: Pedido* | Relacionamento `itens` | Composição `*--` | `@OneToMany(cascade = ALL)` | Relacionamento | Conforme semântica JPA |

*Categorias possíveis*: `Atributo Faltante`, `Tipo Divergente`, `Cardinalidade Incompatível`, `Relacionamento Diferente`, `Entidade Proposta Não Implementada`.

### 3. Diferença entre Proposta (To-Be) vs. Implementação (As-Is)
- Descrever se as divergências decorrem de:
  1. Uma **nova proposta arquitetural** que ainda não foi implementada intencionalmente.
  2. Uma **desatualização da documentação** (código evoluiu e o diagrama ficou para trás).
  3. Uma **inconsistência de modelagem** que requer correção.

### 4. Opções de Ação para o Usuário
Apresentar as opções claramente para escolha do usuário:

- **Opção A (Alinhar Diagrama ao Código Vigente)**:
  Atualizar o arquivo PlantUML para refletir fielmente a implementação atual do código, preservando o código intacto.
- **Opção B (Manter Diagrama como Proposta Arquitetural)**:
  Manter a modificação no diagrama adicionando anotação de "Proposta / Em Planejamento" sem alterar código nem migrations no momento.
- **Opção C (Implementar Alterações no Código / Banco de Dados)**:
  Se o usuário deseja avançar com a implementação, apresentar o plano de migração (classes JPA, migrations, DTOs, testes) e solicitar aprovação para iniciar o desenvolvimento.
