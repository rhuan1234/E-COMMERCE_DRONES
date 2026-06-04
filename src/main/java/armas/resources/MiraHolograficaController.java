package armas.resources;

import java.util.List;
import armas.exception.ValidationException;
import jakarta.validation.Valid;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import armas.services.MiraHolograficaService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import armas.dto.mira.MiraHolograficaRequestDTO;
import armas.dto.mira.MiraHolograficaResponseDTO;
import armas.mapper.MiraHolograficaMapper;
import armas.model.mira.MiraHolografica;

@ApplicationScoped
@Path("/miras-holograficas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MiraHolograficaController {

    @Inject
    MiraHolograficaService miraService;

    @POST
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public Response salvar(@Valid MiraHolograficaRequestDTO mira) {
        if (mira == null) {
            throw new ValidationException("Dados da mira são obrigatórios");
        }
        MiraHolografica nova = miraService.criar(MiraHolograficaMapper.toEntity(mira));
        MiraHolograficaResponseDTO novaDTO = MiraHolograficaMapper.toResponseDTO(nova);
        return Response.status(Response.Status.CREATED).entity(novaDTO).build();
    }

    @GET
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public Response findAll() {
        List<MiraHolograficaResponseDTO> miras = miraService.buscarTodos()
            .stream()
            .map(e -> MiraHolograficaMapper.toResponseDTO(e))
            .toList();
        return Response.ok(miras).build();
    }

    @GET
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response findById(@PathParam("id") Long id) {
        if (id == null) {
            throw new ValidationException("Id da mira holográfica é obrigatório", "id");
        }
        var entity = miraService.buscarPorId(id);
        if (entity == null) {
            throw new NotFoundException("Mira holografica não encontrada");
        }
        MiraHolograficaResponseDTO mira = MiraHolograficaMapper.toResponseDTO(entity);
        return Response.ok(mira).build();
    }

    @GET
    @Path("/modelos/{modelo}")
    @RolesAllowed("ADMIN")
    public Response findByModelo(@PathParam("modelo") String modelo) {
        if (modelo == null || modelo.isBlank()) {
            throw new ValidationException("Modelo da mira holográfica é obrigatório", "modelo");
        }
        var entity = miraService.buscarPorModelo(modelo);
        if (entity == null) {
            throw new NotFoundException("Mira holografica não encontrada");
        }
        MiraHolograficaResponseDTO mira = MiraHolograficaMapper.toResponseDTO(entity);
        return Response.ok(mira).build();
    }

    @Transactional
    @DELETE
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response deletar(@PathParam("id") Long id) {
        if (id == null) {
            throw new ValidationException("Id da mira holográfica é obrigatório", "id");
        }
        if (miraService.deletar(id)) {
            return Response.status(Response.Status.NO_CONTENT).build();
        }
        throw new NotFoundException("Mira holografica não encontrada");
    }

    @Transactional
    @PUT
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response alterar(@PathParam("id") Long id, @Valid MiraHolograficaRequestDTO dados) {
        if (id == null) {
            throw new ValidationException("Id da mira holográfica é obrigatório", "id");
        }
        if (dados == null) {
            throw new ValidationException("Dados da mira são obrigatórios");
        }
        MiraHolografica atualizada = miraService.atualizar(id, MiraHolograficaMapper.toEntity(dados));
        if (atualizada == null) {
            throw new NotFoundException("Mira holografica não encontrada");
        }
        MiraHolograficaResponseDTO atualizadaDTO = MiraHolograficaMapper.toResponseDTO(atualizada);
        return Response.ok(atualizadaDTO).build();
    }
}
