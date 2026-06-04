package armas.resources;

import java.util.List;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import armas.services.RedDotService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import armas.dto.mira.RedDotRequestDTO;
import armas.dto.mira.RedDotResponseDTO;
import armas.exception.ValidationException;
import armas.mapper.RedDotMapper;
import armas.model.mira.RedDot;

@ApplicationScoped
@Path("/red-dots")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RedDotController {

    @Inject
    RedDotService miraService;

    @POST
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public Response salvar(@Valid RedDotRequestDTO mira) {

        if (mira == null) {
            throw new ValidationException(
                "Dados do red dot são obrigatórios"
            );
        }

        RedDot nova = miraService.criar(RedDotMapper.toEntity(mira));
        RedDotResponseDTO novaDTO = RedDotMapper.toResponseDTO(nova);
        return Response.status(Response.Status.CREATED).entity(novaDTO).build();
    }

    @GET
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public Response findAll() {
        List<RedDotResponseDTO> miras = miraService.buscarTodos()
            .stream()
            .map(e -> RedDotMapper.toResponseDTO(e))
            .toList();
        return Response.ok(miras).build();
    }

    @GET
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response findById(@PathParam("id") Long id) {

        if (id == null || id <= 0) {
            throw new ValidationException(
                "Id do red dot inválido",
                "id"
            );
        }

        var entity = miraService.buscarPorId(id);
        if (entity == null) {
            throw new NotFoundException("Red dot not found");
        }
        RedDotResponseDTO mira = RedDotMapper.toResponseDTO(entity);
        return Response.ok(mira).build();
    }

    @GET
    @Path("/admin/modelos/{modelo}")
    @RolesAllowed("ADMIN")
    public Response findByModelo(@PathParam("modelo") String modelo) {

        if (modelo == null || modelo.isBlank()) {
            throw new ValidationException(
                "Modelo do red dot é obrigatório",
                "modelo"
            );
        }

        var entity = miraService.buscarPorModelo(modelo);
        if (entity == null) {
            throw new NotFoundException("Red dot not found");
        }
        RedDotResponseDTO mira = RedDotMapper.toResponseDTO(entity);
        return Response.ok(mira).build();
    }

    @Transactional
    @RolesAllowed("ADMIN")
    @DELETE
    @Path("/admin/{id}")
    public Response deletar(@PathParam("id") Long id) {

        if (id == null || id <= 0) {
            throw new ValidationException(
                "Id do red dot inválido",
                "id"
            );
        }

        if (miraService.deletar(id)) {
            return Response.status(Response.Status.NO_CONTENT).build();
        }
        throw new NotFoundException("Red dot not found");
    }

    @Transactional
    @RolesAllowed("ADMIN")
    @PUT
    @Path("/admin/{id}")
    public Response alterar(@PathParam("id") Long id, @Valid RedDotRequestDTO dados) {

        if (id == null || id <= 0) {
            throw new ValidationException(
                "Id do red dot inválido",
                "id"
            );
        }

        if (dados == null) {
            throw new ValidationException(
                "Dados do red dot são obrigatórios"
            );
        }

        RedDot atualizada = miraService.atualizar(id, RedDotMapper.toEntity(dados));
        if (atualizada == null) {
            throw new NotFoundException("Red dot not found");
        }
        RedDotResponseDTO atualizadaDTO = RedDotMapper.toResponseDTO(atualizada);
        return Response.ok(atualizadaDTO).build();
    }
}
