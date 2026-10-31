package drones.resources;

import java.util.List;

import drones.dto.PageResponse;
import drones.dto.drones.MarcaRequestDTO;
import drones.dto.drones.MarcaResponseDTO;
import drones.exception.ValidationException;
import drones.mapper.MarcaMapper;
import drones.model.drones.Marca;
import drones.services.MarcaService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@ApplicationScoped
@Path("/marcas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MarcaController {

    @Inject
    MarcaService marcaService;

    @POST
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public Response salvar(@Valid MarcaRequestDTO dados) {
        if (dados == null) {
            throw new ValidationException("Dados da marca são obrigatórios");
        }
        Marca marca = marcaService.criar(MarcaMapper.toEntity(dados));
        return Response.status(Response.Status.CREATED)
            .entity(MarcaMapper.toResponseDTO(marca))
            .build();
    }

    @GET
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public PageResponse<MarcaResponseDTO> buscarTodos(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("pageSize") @DefaultValue("10") int pageSize) {
        List<Marca> marcas = marcaService.buscarTodos(page, pageSize);
        long totalItems = marcaService.count();
        return PageResponse.of(marcas, page, pageSize, totalItems, MarcaMapper::toResponseDTO);
    }

    @GET
    public PageResponse<MarcaResponseDTO> buscarTodosEcommerce(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("pageSize") @DefaultValue("10") int pageSize) {
        List<Marca> marcas = marcaService.buscarTodos(page, pageSize);
        long totalItems = marcaService.count();
        return PageResponse.of(marcas, page, pageSize, totalItems, MarcaMapper::toResponseDTO);
    }

    @GET
    @Path("/nomes/{nome}")
    public PageResponse<MarcaResponseDTO> buscarPorNome(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("pageSize") @DefaultValue("10") int pageSize,
            @PathParam("nome") String nome) {
        if (nome == null || nome.isBlank()) {
            throw new ValidationException("Nome da marca é obrigatório", "nome");
        }
        List<Marca> marcas = marcaService.buscarPorNome(page, pageSize, nome);
        long totalItems = marcaService.countNomes(nome);
        return PageResponse.of(marcas, page, pageSize, totalItems, MarcaMapper::toResponseDTO);
    }

    @GET
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response buscarPorId(@PathParam("id") Long id) {
        Marca marca = marcaService.buscarPorId(id);
        if (marca == null) {
            throw new NotFoundException("Marca não encontrada");
        }
        return Response.ok(MarcaMapper.toResponseDTO(marca)).build();
    }

    @PUT
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    @Transactional
    public Response alterar(@PathParam("id") Long id, @Valid MarcaRequestDTO dados) {
        if (dados == null) {
            throw new ValidationException("Dados da marca são obrigatórios");
        }
        Marca marca = marcaService.atualizar(id, MarcaMapper.toEntity(dados));
        if (marca == null) {
            throw new NotFoundException("Marca não encontrada");
        }
        return Response.ok(MarcaMapper.toResponseDTO(marca)).build();
    }

    @DELETE
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    @Transactional
    public Response deletar(@PathParam("id") Long id) {
        Marca marca = marcaService.buscarPorId(id);
        if (marca == null) {
            throw new NotFoundException("Marca não encontrada");
        }
        if (marcaService.deletar(id)) {
            return Response.status(Response.Status.NO_CONTENT).build();
        }
        return Response.status(Response.Status.CONFLICT)
            .entity("Não é possível excluir a marca pois há modelos, drones ou câmeras associados.")
            .build();
    }
}
