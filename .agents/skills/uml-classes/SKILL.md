---
name: uml-classes
description: >-
  Orienta a criação, revisão, padronização e auditoria de diagramas de classes UML
  em PlantUML. Use esta skill ao criar ou editar classes, revisar atributos, tipos,
  visibilidade, relacionamentos (composição, agregação, associação, herança), cardinalidades
  explícitas, escopos de tenant/domínio e ao comparar diagramas PlantUML com código-fonte
  e migrations existentes.
---

# Skill: UML Classes (PlantUML)

Esta skill orienta o agente na criação, revisão, auditoria e padronização contínua de diagramas de classes UML utilizando **PlantUML**. O objetivo é garantir integridade semântica, rigor técnico e alinhamento com as regras de negócio e a arquitetura do projeto.

---

## 🛑 Regras de Ouro Invioláveis

### 1. Proibição de Alteração Automática de Código ou Migrations
> [!CRITICAL]
> **NUNCA altere entidades JPA, migrations, schemas de banco de dados ou código-fonte da aplicação unicamente porque uma alteração foi proposta ou feita no diagrama UML.**
> 
> O diagrama UML frequentemente reflete uma **proposta arquitetural conceitual**, um rascunho de modelagem ou um estudo de viabilidade. Toda e qualquer divergência identificada entre o diagrama e o código/migrations deve ser **documentada e apresentada formalmente ao usuário para aprovação** antes de qualquer modificação no código.

### 2. Consulta Prévia Obrigatória
Antes de propor, criar ou alterar qualquer elemento em um diagrama de classes PlantUML, o agente **DEVE obrigatoriamente** consultar e assimilar:
1. **Regras de Negócio**: [`docs/REGRAS_NEGOCIO.md`](file:///home/leandro/Programas/unitins/topicos-2/E-COMMERCE_DRONES/docs/REGRAS_NEGOCIO.md) (invariantes de domínio, limites, ciclos de vida de entidades, validações).
2. **Contexto do Projeto**: [`docs/CONTEXTO_PROJETO.md`](file:///home/leandro/Programas/unitins/topicos-2/E-COMMERCE_DRONES/docs/CONTEXTO_PROJETO.md) (decisões arquiteturais, tecnologias, separação em pacotes/módulos, DTOs).
3. **Classes e Entidades Existentes**: Mapear as classes já implementadas no backend (`backend/src/main/java/.../model/`) para verificar atributos, anotações JPA, enums e relacionamentos reais.

### 3. Distinção Rígida entre Proposta vs. Implementação Vigente
- O modelo em produção/código é a **Implementação Vigente (As-Is)**.
- O modelo planejado ou desejado é a **Proposta Conceitual (To-Be)**.
- Quando o usuário solicitar uma alteração ou extensão no diagrama, certifique-se de explicitar se o diagrama deve representar o estado atual estrito do código ou uma nova proposta conceitual. Se for proposta, sinalize claramente as diferenças.

---

## 📐 Padrões de Modelagem e Convenções PlantUML

### 1. Visibilidade e Atributos
- **Atributos estritamente privados**: Todos os atributos de entidades de domínio devem utilizar visibilidade privada (`-`), ex: `- id: Long`, `- preco: BigDecimal`.
- **Métodos**: Evite poluir o diagrama com getters/setters triviais. Declare apenas métodos com lógica de negócio ou comportamentos de domínio expressivos (ex: `+ calcularValorTotal(): void`, `+ getSubtotal(): double`). Use a diretiva `hide empty methods` caso classes anêmicas não possuam métodos de domínio.
- **Identificadores**: Devem ter tipo coerente (`Long`, `UUID`, etc.) e visibilidade privada (`- id: Long`).

### 2. Tipagem Coerente com a Stack Tecnológica
- Utilize tipos precisos correspondentes aos padrões do domínio e da stack (Java / PostgreSQL / TypeScript):
  - **Identificadores**: `Long` ou `UUID`.
  - **Textos e Códigos**: `String` (ou Enum específico).
  - **Valores Monetários e Descontos**: `BigDecimal` (preferencial para precisão monetária) ou `Double` (se já estabelecido na base).
  - **Medidas Físicas / Numéricas**: `double`, `int`, `Integer`.
  - **Datas e Horários**: `LocalDateTime`, `LocalDate` ou `Instant`.
  - **Flags de Estado**: `boolean` (ex: `- ativo: boolean`).
  - **Estados e Tipos Fixos**: Declarar explicitamente como `enum NomeDoEnum`.

### 3. Relacionamentos Semânticos em PlantUML
Sempre utilize a notação semântica correta do PlantUML em vez de simples setas genéricas:

| Relacionamento | Notação PlantUML | Semântica e Quando Usar | Exemplo no Domínio |
| :--- | :---: | :--- | :--- |
| **Composição** | `*--` | **Ciclo de vida fortemente acoplado.** Se o todo for excluído, as partes deixam de existir. Representa posse exclusiva (`orphanRemoval=true`, `CascadeType.ALL`). | `Pedido "1" *-- "1..*" ItemPedido : itens`<br>`Drone "1" *-- "0..5" DroneImage : imagens`<br>`Cidade "1" *-- "0..*" Endereco : enderecos` |
| **Agregação** | `o--` | **Ciclo de vida compartilhado ou independente.** A parte pode existir sem o todo. Representa catálogo, vínculo comercial ou promoção. | `Fornecedor "1" o-- "0..*" Drone : fornece`<br>`Promocao "0..1" o-- "0..*" Drone : aplica-se-a` |
| **Associação Direcionada** | `-->` ou `<--` | **Conhecimento / Navegabilidade unilateral.** Uma entidade referencia outra sem posse existencial estrita. | `Drone "0..*" --> "1" Marca : marca`<br>`Drone "0..*" --> "1" Fornecedor : fornecedor`<br>`Usuario "1" --> "0..*" Pedido : historico` |
| **Herança / Generalização** | `<|--` | **Especialização polimórfica (Is-a).** Subclasses que herdam estrutura e comportamento da classe base/abstrata. | `Pagamento <|-- PagamentoPix`<br>`Pagamento <|-- PagamentoCartao` |
| **Dependência** | `..>` | **Uso temporário / dependência de parâmetro ou serviço.** | `ServicoPedido ..> ValidadorEstoque` |

### 4. Cardinalidades Explícitas
- **Obrigatoriedade**: Toda relação deve ter cardinalidade explícita em ambas as pontas (ou na ponta alvo quando a navegabilidade for unilateral).
- **Formatos padronizados**:
  - `"1"` : Exatamente um (obrigatório).
  - `"0..1"` : Zero ou um (opcional/nullable).
  - `"1..*"` : Um ou muitos (pelo menos um obrigatório).
  - `"0..*"` : Zero ou muitos (coleção comum).
  - `"0..N"` : Limite máximo específico (ex: `"0..5"` para imagens de um Drone).
- **Rótulos dos Relacionamentos**: Sempre nomeie a relação ou atributo de navegação (ex: `: itens`, `: fornecedor`, `: modelos`).

### 5. Relacionamentos Tenant-Scoped e Escopos de Propriedade
- Em entidades que pertencem a um usuário, conta ou tenant específico (ex: `Endereco`, `Pedido`, `Favorito`, `Avaliacao`), valide:
  1. A cardinalidade com a entidade guardiã do escopo (ex: `Usuario "1" --> "0..*" Pedido : historico`).
  2. Se a entidade filha contém chave estrangeira direta (`usuario_id`) ou se o acesso é mediado por agregação/composição.
  3. A integridade transacional de não permitir que entidades de um escopo/tenant acessem ou compartilhem dados de outro escopo.

### 6. Responsabilidade Única (SRP) e Pacotes
- Agrupar classes em pacotes lógicos (`package "nome.do.pacote" { ... }`) alinhados aos bounded contexts do negócio (ex: `usuario`, `fornecedor`, `drones`, `promocao`, `pedido`).
- Cada classe deve possuir uma responsabilidade bem delimitada. Evite "God Classes" que concentram atributos de múltiplos domínios.

---

## 🔄 Fluxo de Execução: Criação e Edição de Diagramas

Ao ser acionado para criar ou revisar diagramas, siga este fluxo:

```
┌───────────────────────────────────────────────┐
│ 1. Leitura de docs/ e Código Existente        │
│    (REGRAS_NEGOCIO.md, CONTEXTO, entidades)  │
└───────────────────────┬───────────────────────┘
                        ▼
┌───────────────────────────────────────────────┐
│ 2. Análise Semântica e Modelagem PlantUML     │
│    (Classes, Atributos "-", Relações, Tipos)  │
└───────────────────────┬───────────────────────┘
                        ▼
┌───────────────────────────────────────────────┐
│ 3. Auditoria de Conformidade (Diagrama vs BD) │
│    (Comparar cardinalidades, cascades, tipos) │
└───────────────────────┬───────────────────────┘
                        ▼
┌───────────────────────────────────────────────┐
│ 4. Apresentação de Relatório de Divergências  │
│    (Solicitar aprovação prévia do usuário)    │
└───────────────────────┬───────────────────────┘
                        ▼
┌───────────────────────────────────────────────┐
│ 5. Atualização Autorizada                     │
│    (Diagrama atualizado; código só com aval)  │
└───────────────────────────────────────────────┘
```

---

## 🔍 Procedimento de Comparação: Diagrama vs. Código

Ao comparar um arquivo PlantUML (`docs/modelo.plantuml`) com a base de código (`backend/src/main/java/...`):

1. **Verificar Pacotes e Entidades**:
   - Para cada `class` no diagrama, verificar se existe `@Entity class Entidade` correspondente.
   - Para cada `enum` no diagrama, verificar a enumeração no código.
2. **Verificar Atributos e Tipos**:
   - Nomes de atributos em camelCase idênticos.
   - Tipos de dados equivalentes (`Long` <-> `Long`, `BigDecimal` <-> `BigDecimal`, `LocalDateTime` <-> `LocalDateTime`).
   - Visibilidade estritamente privada (`-` no PlantUML <-> `private` no Java).
3. **Verificar Relacionamentos e Cardinalidades**:
   - `*-- "0..*"` deve refletir `@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)`.
   - `o-- "0..*"` deve refletir `@OneToMany` sem cascade de exclusão ou vínculo frouxo.
   - `--> "1"` deve refletir `@ManyToOne(optional = false)`.
   - `--> "0..1"` deve refletir `@ManyToOne(optional = true)`.
   - `<|--` deve refletir herança JPA (`@Inheritance(strategy = ...)`).
4. **Gerar Relatório de Divergências**:
   - Utilize o modelo em [Template de Relatório de Divergências](./references/divergence-report-template.md).

---

## 📋 Checklist de Validação para o Agente

Antes de finalizar qualquer alteração em diagramas PlantUML, valide cada item:

- [ ] **Consulta Prévia**: Li `docs/REGRAS_NEGOCIO.md` e `docs/CONTEXTO_PROJETO.md` antes de editar o diagrama?
- [ ] **Código Intacto**: Assegurei que **nenhuma** entidade JPA, migration ou código foi modificado sem aprovação explícita?
- [ ] **Visibilidade**: Todos os atributos possuem o prefixo de visibilidade privada (`-`)?
- [ ] **Tipagem Coerente**: Os tipos são precisos (`Long`, `String`, `BigDecimal`, `LocalDateTime`, enums)?
- [ ] **Semântica de Relação**: Usei `*--` para composições e `o--` para agregações corretamente?
- [ ] **Cardinalidades Explícitas**: Todas as relações possuem cardinalidades (`"1"`, `"0..1"`, `"0..*"`, etc.) e rótulos?
- [ ] **Escopo de Tenant/Usuário**: Relações de posse de dados (ex: usuário e pedidos/endereços) foram respeitadas?
- [ ] **SRP**: As classes mantêm responsabilidade única sem sobrecarga de funções?
- [ ] **Sintaxe PlantUML Válida**: A sintaxe compila sem erros (blocos fechados, skins limpos, `hide empty methods`)?
- [ ] **Aprovação Solicitada**: Apresentei ao usuário quaisquer divergências entre proposta e código para decisão?

---

## 📚 Documentos de Referência
- [Guia Rápido de Sintaxe PlantUML](./references/plantuml-cheatsheet.md)
- [Template de Relatório de Divergências](./references/divergence-report-template.md)
