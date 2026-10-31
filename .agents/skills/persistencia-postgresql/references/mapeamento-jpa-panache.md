# Mapeamento JPA, Hibernate ORM e Panache Repository

Este documento orienta os padrões de modelagem de entidades JPA e repositórios Panache em conjunto com PostgreSQL.

---

## 1. Encapsulamento e Estrutura de Entidades

Toda entidade JPA gerenciada pelo Hibernate ORM deve respeitar o princípio do encapsulamento estrito:

1. **Atributos Estritamente Privados**:
   - Nenhum atributo deve ser `public`, `protected` ou `package-private` (exceto quando estritamente exigido por convenção JPA para classes base de herança ou identificadores embutidos).
   - Não use o padrão Active Record do Panache (`extends PanacheEntity` com campos públicos). Adote a abordagem baseada em repositório: classe POJO com `@Entity` e repositório separado (`PanacheRepository<T>`).

2. **Acessores Explícitos**:
   - Forneça métodos getters e setters explícitos em `camelCase`.
   - Modificadores de chave primária (`setId`) devem ser protegidos ou evitados fora de fábricas/mappers para prevenir mutação inadvertida de identidade.
   - Para relacionamentos colecionáveis (`List`, `Set`), evite expor a coleção mutável diretamente. Forneça métodos de negócio (`adicionarItem`, `removerItem`) que mantenham os dois lados do relacionamento sincronizados.

3. **Construtores e Identificadores**:
   - Construtor padrão sem argumentos obrigatório (público ou protegido para uso exclusivo do Hibernate).
   - Identificadores sintéticos devem usar tipo numérico (`Long`) com geração `GenerationType.IDENTITY`, mapeando para sequências ou `GENERATED ALWAYS AS IDENTITY` no PostgreSQL.

```java
@Entity
@Table(name = "drone")
public class Drone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false, length = 150)
    private String nome;

    @Column(name = "preco", nullable = false, precision = 12, scale = 2)
    private BigDecimal preco;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marca_id", nullable = false)
    private Marca marca;

    @OneToMany(mappedBy = "drone", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DroneImage> imagens = new ArrayList<>();

    @Version
    @Column(name = "versao", nullable = false)
    private Long versao;

    public Drone() {}

    // Getters e setters explícitos...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public BigDecimal getPreco() { return preco; }
    public void setPreco(BigDecimal preco) { this.preco = preco; }

    public Marca getMarca() { return marca; }
    public void setMarca(Marca marca) { this.marca = marca; }

    public List<DroneImage> getImagens() {
        return Collections.unmodifiableList(imagens);
    }

    public void adicionarImagem(DroneImage imagem) {
        imagens.add(imagem);
        imagem.setDrone(this);
    }

    public void removerImagem(DroneImage imagem) {
        imagens.remove(imagem);
        imagem.setDrone(null);
    }

    public Long getVersao() { return versao; }
    public void setVersao(Long versao) { this.versao = versao; }
}
```

---

## 2. Tipos de Dados e Mapeamento PostgreSQL

| Tipo Conceitual | Tipo Java Recomendado | Coluna PostgreSQL | Anotações JPA |
| :--- | :--- | :--- | :--- |
| **Chave Primária** | `Long` | `BIGINT` (Identity) | `@Id @GeneratedValue(strategy = GenerationType.IDENTITY)` |
| **Texto Curto/Médio**| `String` | `VARCHAR(n)` | `@Column(nullable = false, length = n)` |
| **Texto Longo** | `String` | `TEXT` | `@Column(columnDefinition = "TEXT")` |
| **Valor Monetário** | `BigDecimal` | `NUMERIC(15, 2)` | `@Column(precision = 15, scale = 2)` |
| **Data e Hora** | `LocalDateTime` ou `Instant` | `TIMESTAMPTZ` | `@Column(nullable = false)` |
| **Data Sem Hora** | `LocalDate` | `DATE` | `@Column(nullable = false)` |
| **Booleano** | `boolean` / `Boolean` | `BOOLEAN` | `@Column(nullable = false)` |
| **Enumeração** | `enum` Java | `VARCHAR(30)` | `@Enumerated(EnumType.STRING)` (obrigatório) |
| **UUID** | `UUID` | `UUID` | `@Column(columnDefinition = "uuid")` |

> [!WARNING]
> Nunca utilize `@Enumerated(EnumType.ORDINAL)`. A reordenação de constantes no enum quebra a integridade lógica dos registros legados no banco de dados.

---

## 3. Relacionamentos e Desempenho (Prevenção de N+1)

1. **`@ManyToOne` e `@OneToOne`**:
   - Defina `fetch = FetchType.LAZY` explicitamente. O padrão da JPA para relações to-one é `EAGER`, o que dispara consultas extras e degrada a performance.
2. **`@OneToMany` e `@ManyToMany`**:
   - O padrão já é `LAZY`. Mantenha-o.
   - Use `orphanRemoval = true` apenas quando a entidade filha não tiver ciclo de vida próprio fora da entidade pai (ex: itens de um pedido, imagens de um drone).
3. **Mapeamento de Chaves Estrangeiras**:
   - Especifique sempre `@JoinColumn(name = "...", nullable = ...)` com nome explícito em snake_case.
4. **Herança Polimórfica**:
   - Prefira `InheritanceType.JOINED` quando as subclasses possuírem atributos específicos e tabelas normalizadas próprias (ex: `Pagamento` base com especializações `PagamentoPix` e `PagamentoCartao`).

---

## 4. Padrão Panache Repository

Todo repositório deve ser anotado com `@ApplicationScoped` e implementar `PanacheRepository<T>`.

### 4.1 Princípios de Consulta
- **Queries Parametrizadas**: Nunca concatene strings em queries HQL/Panache para evitar vulnerabilidades de injeção. Use mapas nomeados (`Map<String, Object> params`) ou parâmetros posicionais (`?1, ?2`).
- **Uso de ILIKE para buscas no PostgreSQL**: Use `ILIKE` para buscas case-insensitive eficientes.
- **Paginação Padronizada**: Utilize `PanacheQuery.page(Page.of(page, pageSize))` combinada com `pageCount()` e `count()`.

```java
@ApplicationScoped
public class DroneRepository implements PanacheRepository<Drone> {

    public Optional<Drone> buscarPorIdComMarcaEModelo(Long id) {
        return find("SELECT d FROM Drone d JOIN FETCH d.marca JOIN FETCH d.modelo WHERE d.id = ?1", id)
                .firstResultOptional();
    }

    public PanacheQuery<Drone> listarFiltrados(String nome, Long marcaId, BigDecimal precoMax) {
        StringBuilder hql = new StringBuilder("1 = 1");
        Map<String, Object> params = new HashMap<>();

        if (nome != null && !nome.isBlank()) {
            hql.append(" AND d.nome ILIKE :nome");
            params.put("nome", "%" + nome.trim() + "%");
        }
        if (marcaId != null) {
            hql.append(" AND d.marca.id = :marcaId");
            params.put("marcaId", marcaId);
        }
        if (precoMax != null) {
            hql.append(" AND d.preco <= :precoMax");
            params.put("precoMax", precoMax);
        }

        return find(hql.toString(), params);
    }
}
```
