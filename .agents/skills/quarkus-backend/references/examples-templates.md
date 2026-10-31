# Exemplos Canônicos e Templates de Código - Quarkus Backend

Utilize estes modelos estruturais como referência de implementação para manter total uniformidade com a base de código do projeto.

---

## 1. DTOs de Entrada e Saída (Java Records)

### 1.1 Request DTO (`drones/dto/exemplo/ItemRequestDTO.java`)
```java
package drones.dto.exemplo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ItemRequestDTO(
    @NotBlank(message = "O nome é obrigatório")
    @Size(min = 2, max = 100, message = "O nome deve ter entre 2 e 100 caracteres")
    String nome,

    @NotNull(message = "O preço é obrigatório")
    @Positive(message = "O preço deve ser maior que zero")
    BigDecimal preco,

    @NotNull(message = "O ID da categoria é obrigatório")
    Long categoriaId
) {}
```

### 1.2 Response DTO (`drones/dto/exemplo/ItemResponseDTO.java`)
```java
package drones.dto.exemplo;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ItemResponseDTO(
    Long id,
    String nome,
    BigDecimal preco,
    Long categoriaId,
    String categoriaNome,
    LocalDateTime dataCadastro
) {}
```

---

## 2. Mapper Estático Puro (`drones/mapper/ItemMapper.java`)

```java
package drones.mapper;

import drones.dto.exemplo.ItemRequestDTO;
import drones.dto.exemplo.ItemResponseDTO;
import drones.model.exemplo.Categoria;
import drones.model.exemplo.Item;

public final class ItemMapper {

    private ItemMapper() {
        // Construtor privado para classe utilitária estática
    }

    public static Item toEntity(ItemRequestDTO dto, Categoria categoria) {
        if (dto == null) {
            return null;
        }

        Item item = new Item();
        item.setNome(dto.nome());
        item.setPreco(dto.preco());
        item.setCategoria(categoria);
        return item;
    }

    public static ItemResponseDTO toResponseDTO(Item entity) {
        if (entity == null) {
            return null;
        }

        return new ItemResponseDTO(
            entity.getId(),
            entity.getNome(),
            entity.getPreco(),
            entity.getCategoria() != null ? entity.getCategoria().getId() : null,
            entity.getCategoria() != null ? entity.getCategoria().getNome() : null,
            entity.getDataCadastro()
        );
    }
}
```

---

## 3. Repositório Panache (`drones/repository/ItemRepository.java`)

```java
package drones.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Parameters;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import drones.model.exemplo.Item;

@ApplicationScoped
public class ItemRepository implements PanacheRepository<Item> {

    public List<Item> buscarPorCategoria(Long categoriaId, int page, int pageSize) {
        return find("categoria.id = :catId order by nome asc", Parameters.with("catId", categoriaId))
                .page(Page.of(page, pageSize))
                .list();
    }

    public long contarPorCategoria(Long categoriaId) {
        return count("categoria.id = :catId", Parameters.with("catId", categoriaId));
    }
}
```

---

## 4. Contrato de Serviço (`drones/services/ItemServiceInterface.java`)

```java
package drones.services;

import java.util.List;
import drones.dto.exemplo.ItemRequestDTO;
import drones.model.exemplo.Item;

public interface ItemServiceInterface {
    Item criar(ItemRequestDTO dto);
    Item buscarPorId(Long id);
    List<Item> listarPorCategoria(Long categoriaId, int page, int pageSize);
    long contarPorCategoria(Long categoriaId);
    Item atualizar(Long id, ItemRequestDTO dto);
    void excluir(Long id);
}
```

---

## 5. Implementação de Serviço (`drones/services/ItemService.java`)

```java
package drones.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import java.time.LocalDateTime;
import java.util.List;

import drones.dto.exemplo.ItemRequestDTO;
import drones.exception.ValidationException;
import drones.mapper.ItemMapper;
import drones.model.exemplo.Categoria;
import drones.model.exemplo.Item;
import drones.repository.CategoriaRepository;
import drones.repository.ItemRepository;

@ApplicationScoped
public class ItemService implements ItemServiceInterface {

    @Inject
    ItemRepository itemRepository;

    @Inject
    CategoriaRepository categoriaRepository;

    @Override
    @Transactional
    public Item criar(ItemRequestDTO dto) {
        if (dto == null) {
            throw new ValidationException("Os dados do item são obrigatórios");
        }

        Categoria categoria = categoriaRepository.findById(dto.categoriaId());
        if (categoria == null) {
            throw new ValidationException("Categoria informada não existe", "categoriaId");
        }

        Item item = ItemMapper.toEntity(dto, categoria);
        item.setDataCadastro(LocalDateTime.now());

        itemRepository.persist(item);
        return item;
    }

    @Override
    public Item buscarPorId(Long id) {
        Item item = itemRepository.findById(id);
        if (item == null) {
            throw new NotFoundException("Item não encontrado");
        }
        return item;
    }

    @Override
    public List<Item> listarPorCategoria(Long categoriaId, int page, int pageSize) {
        return itemRepository.buscarPorCategoria(categoriaId, page, pageSize);
    }

    @Override
    public long contarPorCategoria(Long categoriaId) {
        return itemRepository.contarPorCategoria(categoriaId);
    }

    @Override
    @Transactional
    public Item atualizar(Long id, ItemRequestDTO dto) {
        Item item = buscarPorId(id);

        Categoria categoria = categoriaRepository.findById(dto.categoriaId());
        if (categoria == null) {
            throw new ValidationException("Categoria informada não existe", "categoriaId");
        }

        item.setNome(dto.nome());
        item.setPreco(dto.preco());
        item.setCategoria(categoria);

        return item;
    }

    @Override
    @Transactional
    public void excluir(Long id) {
        Item item = buscarPorId(id);
        itemRepository.delete(item);
    }
}
```

---

## 6. Resource REST / Controller (`drones/resources/ItemController.java`)

```java
package drones.resources;

import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

import org.eclipse.microprofile.jwt.JsonWebToken;

import drones.dto.PageResponse;
import drones.dto.exemplo.ItemRequestDTO;
import drones.dto.exemplo.ItemResponseDTO;
import drones.mapper.ItemMapper;
import drones.model.exemplo.Item;
import drones.services.ItemServiceInterface;

@ApplicationScoped
@Path("/itens")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ItemController {

    @Inject
    ItemServiceInterface itemService;

    @Inject
    JsonWebToken jwt;

    @POST
    @RolesAllowed("ADMIN")
    public Response criar(@Valid ItemRequestDTO dto) {
        Item itemCriado = itemService.criar(dto);

        return Response.status(Response.Status.CREATED)
                .entity(ItemMapper.toResponseDTO(itemCriado))
                .build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response buscarPorId(@PathParam("id") Long id) {
        Item item = itemService.buscarPorId(id);
        return Response.ok(ItemMapper.toResponseDTO(item)).build();
    }

    @GET
    @Path("/categoria/{categoriaId}")
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public PageResponse<ItemResponseDTO> listarPorCategoria(
            @PathParam("categoriaId") Long categoriaId,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("pageSize") @DefaultValue("10") int pageSize) {

        List<Item> itens = itemService.listarPorCategoria(categoriaId, page, pageSize);
        long total = itemService.contarPorCategoria(categoriaId);

        return PageResponse.of(itens, page, pageSize, total, ItemMapper::toResponseDTO);
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed("ADMIN")
    public Response atualizar(@PathParam("id") Long id, @Valid ItemRequestDTO dto) {
        Item itemAtualizado = itemService.atualizar(id, dto);
        return Response.ok(ItemMapper.toResponseDTO(itemAtualizado)).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("ADMIN")
    public Response excluir(@PathParam("id") Long id) {
        itemService.excluir(id);
        return Response.noContent().build();
    }
}
```
