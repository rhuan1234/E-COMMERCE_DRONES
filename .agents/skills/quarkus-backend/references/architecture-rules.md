# Diretrizes de Arquitetura e Camadas - Quarkus Backend

Este documento detalha o padrão arquitetural obrigatório para o módulo backend Quarkus. Toda implementação deve seguir estritamente a separação em camadas, desacoplamento por domínio e encapsulamento de contratos.

---

## 1. Fluxo Canônico de Camadas

```
[Cliente HTTP / Frontend]
          │
          ▼
1. [Resource (Controller)]   -> drones.resources.*
          │
          ▼
2. [Service Interface]       -> drones.services.*Interface
          │
          ▼
3. [Service Implementation]  -> drones.services.*Service
          │
          ▼
4. [Repository (Panache)]    -> drones.repository.*Repository
          │
          ▼
5. [Entity (Panache/JPA)]    -> drones.model.*
          │
          ▼
6. [Static Mapper]           -> drones.mapper.*Mapper
          │
          ▼
[DTO de Resposta (Record)]   -> drones.dto.*
```

---

## 2. Responsabilidades por Camada

### 2.1 Camada de Recursos (`drones.resources.*Controller.java`)
- **Papel**: Ponto de entrada HTTP REST via JAX-RS.
- **Anotações**: `@ApplicationScoped`, `@Path("/...")`, `@Produces(MediaType.APPLICATION_JSON)`, `@Consumes(MediaType.APPLICATION_JSON)`.
- **Segurança**: Definir permissões de acesso com `@RolesAllowed("ADMIN")`, `@RolesAllowed({"CLIENTE", "ADMIN"})` ou `@Authenticated`.
- **Validação de Entrada**: Anotar DTOs de entrada com `@Valid`.
- **Identificação do Usuário**: Injetar `JsonWebToken jwt` e obter `String login = jwt.getName()`.
- **Regras Estritas**:
  - **NÃO** implementar regras de negócio no Resource.
  - **NÃO** injetar ou chamar `Repositories` diretamente; use sempre a `*ServiceInterface`.
  - **NUNCA** retornar entidades JPA diretamente.
  - Mapear a saída sempre para `*ResponseDTO` ou `PageResponse<*ResponseDTO>`.
  - Retornar status HTTP semânticos:
    - `200 OK`: Consultas com sucesso e atualizações com retorno.
    - `201 CREATED`: Criação de recursos, com header `Location` ou payload do DTO criado (`Response.status(Status.CREATED).entity(dto).build()`).
    - `204 NO CONTENT`: Exclusões ou mutações sem retorno de corpo.
    - `400 BAD REQUEST`: Erros de validação (via `ValidationException`).
    - `401 UNAUTHORIZED`: Falha de autenticação.
    - `403 FORBIDDEN`: Violação de autorização/role.
    - `404 NOT FOUND`: Recurso não encontrado.

### 2.2 Camada de Serviços (`drones.services.*`)
- **Contrato (`*ServiceInterface.java`)**:
  - Define os métodos de negócio que o módulo oferece.
  - Permite testes unitários desacoplados e facilidade de mock.
- **Implementação (`*Service.java`)**:
  - Anotada com `@ApplicationScoped`.
  - Contém **todas as regras de negócio**, validações de consistência e cálculos.
  - Orquestra chamadas a múltiplos Repositories e serviços auxiliares (Mailer, Storage, etc.).
- **Transacionalidade (`@Transactional`)**:
  - Todo método que altera o banco de dados (persist, update, delete, merge, reserva de estoque) **DEVE** conter `@Transactional`.
  - Métodos puramente de leitura não necessitam de `@Transactional`.
  - Violações de negócio devem disparar `throw new ValidationException("mensagem", "campo")`, o que garante rollback automático da transação ativa.

### 2.3 Camada de Repositórios (`drones.repository.*Repository.java`)
- **Papel**: Isolamento da persistência e consultas ao PostgreSQL.
- **Anotações**: `@ApplicationScoped`, implementando `PanacheRepository<T>` ou `PanacheRepositoryBase<T, Long>`.
- **Boas Práticas**:
  - Utilizar consultas Panache (`find("...", params)`, `list("...", params)`, `count("...", params)`).
  - Queries customizadas com paginação: `.page(Page.of(page, pageSize)).list()`.
  - **Proibição estrita de concatenação de SQL puro**: Sempre utilize parâmetros nomeados ou posicionais do Panache para impedir SQL Injection.

### 2.4 Camada de Modelos e Entidades (`drones.model.*`)
- **Papel**: Representação relacional mapeada pelo Hibernate ORM.
- **Herança**: Herdam de `PanacheEntityBase` (para controle explícito de chave primária `@Id` gerada por sequence) ou `PanacheEntity`.
- **Anotações de Relacionamento**:
  - `@ManyToOne`, `@OneToMany`, `@ManyToMany`, `@JoinColumn`.
  - Use `fetch = FetchType.LAZY` para relacionamentos dependentes, evitando consultas N+1 desnecessárias.
- **Encapsulamento**:
  - Atributos privados com getters e setters (ou métodos utilitários de negócio específicos).
  - Nunca adicione anotações Jackson (`@JsonIgnore`, `@JsonProperty`) nas entidades como tentativa de controlar a serialização da API. O controle é feito nos DTOs.

---

## 3. Contratos DTO (Data Transfer Objects) e Mappers

### 3.1 DTOs como Java Records (`drones.dto.*`)
- **Imutabilidade**: DTOs de entrada e saída devem ser declarados exclusivamente como Java `record`.
- **Separação por Domínio**:
  - `drones.dto.drones`
  - `drones.dto.fornecedores`
  - `drones.dto.pedidos`
  - `drones.dto.promocao`
  - `drones.dto.usuarios`
  - `drones.dto.auth`
- **Prefixos e Sufixos**:
  - `*RequestDTO`: Dados enviados pelo cliente (ex: `DroneRequestDTO`, `PedidoRequestDTO`). Devem conter anotações de validação (`@NotBlank`, `@NotNull`, `@Min`, `@Email`, etc.).
  - `*ResponseDTO`: Dados retornados pela API (ex: `DroneResponseDTO`, `PedidoResponseDTO`). Não devem expor senhas, chaves criptográficas ou detalhes internos de infraestrutura.

### 3.2 Mappers Estáticos Puros (`drones.mapper.*Mapper.java`)
- Classes utilitárias com métodos estáticos públicos e puros:
  ```java
  public class DroneMapper {
      public static Drone toEntity(DroneRequestDTO dto, Marca marca, Modelo modelo) { ... }
      public static DroneResponseDTO toResponseDTO(Drone entity) { ... }
  }
  ```
- **Vantagens**:
  - Zero overhead de frameworks de reflexão em tempo de compilação/execução.
  - Total rastreabilidade e facilidade para debugging em Java 25.
  - Conversão determinística de coleções e campos aninhados.

---

## 4. Paginação Padronizada (`PageResponse<T>`)

Para listagens paginadas, utilize sempre a classe genérica `drones.dto.PageResponse<T>`:

```java
@GET
public PageResponse<DroneResponseDTO> listar(
        @QueryParam("page") @DefaultValue("0") int page,
        @QueryParam("pageSize") @DefaultValue("10") int pageSize) {

    List<Drone> drones = droneService.listarPaginado(page, pageSize);
    long total = droneService.contar();

    return PageResponse.of(drones, page, pageSize, total, DroneMapper::toResponseDTO);
}
```

Estrutura JSON gerada:
```json
{
  "items": [ ... ],
  "page": 0,
  "pageSize": 10,
  "totalItems": 42,
  "totalPages": 5
}
```

---

## 5. Tratamento de Exceções e Respostas de Erro

- Nunca capture exceções para silenciá-las com `e.printStackTrace()` ou retornar `Response.serverError()`.
- Use as exceções mapeadas globalmente:
  1. `ValidationException("Mensagem descritiva", "nomeDoCampo")`:
     - Interceptada por `ValidationExceptionMapper`.
     - Retorna HTTP 400 com payload estruturado contendo lista de violações de negócio.
  2. `ConstraintViolationException`:
     - Disparada automaticamente pelo Bean Validation (`@Valid`).
     - Interceptada por `ConstraintViolationExceptionMapper`.
  3. `NotFoundException("Recurso não encontrado")`:
     - Retorna HTTP 404 padronizado.
  4. `UnauthorizedException` / `SecurityException`:
     - Interceptadas para HTTP 401 e 403.
