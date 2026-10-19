package drones.resources;

import java.util.List;

import drones.dto.PageResponse;
import drones.dto.drones.ModeloRequestDTO;
import drones.dto.drones.ModeloResponseDTO;
import drones.exception.ValidationException;
import drones.mapper.ModeloMapper;
import drones.model.drones.Modelo;
import drones.services.ModeloService;
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
@Path("/modelos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ModeloController {

    @Inject
    ModeloService modeloService;

    @POST
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public Response salvar(@Valid ModeloRequestDTO dados) {
        if (dados == null) {
            throw new ValidationException("Dados do modelo são obrigatórios");
        }
        Modelo modelo = modeloService.criar(ModeloMapper.toEntity(dados));
        return Response.status(Response.Status.CREATED)
            .entity(ModeloMapper.toResponseDTO(modelo))
            .build();
    }

    @GET
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public PageResponse<ModeloResponseDTO> buscarTodos(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("pageSize") @DefaultValue("10") int pageSize,
            @QueryParam("marcaId") Long marcaId) {
        if (marcaId != null && marcaId > 0) {
            List<Modelo> modelos = modeloService.buscarPorMarca(page, pageSize, marcaId);
            long totalItems = modeloService.countPorMarca(marcaId);
            return PageResponse.of(modelos, page, pageSize, totalItems, ModeloMapper::toResponseDTO);
        }
        List<Modelo> modelos = modeloService.buscarTodos(page, pageSize);
        long totalItems = modeloService.count();
        return PageResponse.of(modelos, page, pageSize, totalItems, ModeloMapper::toResponseDTO);
    }

    @GET
    public PageResponse<ModeloResponseDTO> buscarTodosEcommerce(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("pageSize") @DefaultValue("10") int pageSize) {
        List<Modelo> modelos = modeloService.buscarTodos(page, pageSize);
        long totalItems = modeloService.count();
        return PageResponse.of(modelos, page, pageSize, totalItems, ModeloMapper::toResponseDTO);
    }

    @GET
    @Path("/marcas/{marcaId}")
    public PageResponse<ModeloResponseDTO> buscarPorMarca(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("pageSize") @DefaultValue("100") int pageSize,
            @PathParam("marcaId") Long marcaId) {
        if (marcaId == null || marcaId <= 0) {
            throw new ValidationException("Id da marca inválido", "marcaId");
        }
        List<Modelo> modelos = modeloService.buscarPorMarca(page, pageSize, marcaId);
        long totalItems = modeloService.countPorMarca(marcaId);
        return PageResponse.of(modelos, page, pageSize, totalItems, ModeloMapper::toResponseDTO);
    }

    @GET
    @Path("/nomes/{nome}")
    public PageResponse<ModeloResponseDTO> buscarPorNome(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("pageSize") @DefaultValue("10") int pageSize,
            @PathParam("nome") String nome) {
        if (nome == null || nome.isBlank()) {
            throw new ValidationException("Nome do modelo é obrigatório", "nome");
        }
        List<Modelo> modelos = modeloService.buscarPorNome(page, pageSize, nome);
        long totalItems = modeloService.countNomes(nome);
        return PageResponse.of(modelos, page, pageSize, totalItems, ModeloMapper::toResponseDTO);
    }

    @GET
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response buscarPorId(@PathParam("id") Long id) {
        Modelo modelo = modeloService.buscarPorId(id);
        if (modelo == null) {
            throw new NotFoundException("Modelo não encontrado");
        }
        return Response.ok(ModeloMapper.toResponseDTO(modelo)).build();
    }

    @PUT
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    @Transactional
    public Response alterar(@PathParam("id") Long id, @Valid ModeloRequestDTO dados) {
        if (dados == null) {
            throw new ValidationException("Dados do modelo são obrigatórios");
        }
        Modelo modelo = modeloService.atualizar(id, ModeloMapper.toEntity(dados));
        if (modelo == null) {
            throw new NotFoundException("Modelo não encontrado");
        }
        return Response.ok(ModeloMapper.toResponseDTO(modelo)).build();
    }

    @DELETE
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    @Transactional
    public Response deletar(@PathParam("id") Long id) {
        Modelo modelo = modeloService.buscarPorId(id);
        if (modelo == null) {
            throw new NotFoundException("Modelo não encontrado");
        }
        if (modeloService.deletar(id)) {
            return Response.status(Response.Status.NO_CONTENT).build();
        }
        return Response.status(Response.Status.CONFLICT)
            .entity("Não é possível excluir o modelo pois há drones ou câmeras associados.")
            .build();
    }
}
