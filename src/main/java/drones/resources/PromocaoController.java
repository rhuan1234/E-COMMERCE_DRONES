package drones.resources;

import java.util.List;

import drones.dto.promocao.PromocaoRequestDTO;
import drones.dto.promocao.PromocaoResponseDTO;
import drones.exception.ValidationException;
import drones.mapper.PromocaoMapper;
import drones.model.promocao.Promocao;
import drones.services.PromocaoService;
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
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@ApplicationScoped
@Path("/promocoes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PromocaoController {
    @Inject
    PromocaoService promocaoService;

    @POST
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public Response salvar(@Valid PromocaoRequestDTO dados) {
        if (dados == null) {
            throw new ValidationException("Dados da promoção são obrigatórios");
        }
        Promocao promocao = promocaoService.criar(PromocaoMapper.toEntity(dados), dados.droneIds());
        return Response.status(Response.Status.CREATED).entity(PromocaoMapper.toResponseDTO(promocao)).build();
    }

    @GET
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public Response buscarTodos() {
        List<PromocaoResponseDTO> promocoes = promocaoService.buscarTodos().stream()
                .map(PromocaoMapper::toResponseDTO)
                .toList();
        return Response.ok(promocoes).build();
    }

    @GET
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response buscarPorId(@PathParam("id") Long id) {
        return Response.ok(PromocaoMapper.toResponseDTO(promocaoService.buscarPorId(id))).build();
    }

    @PUT
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    @Transactional
    public Response atualizar(@PathParam("id") Long id, @Valid PromocaoRequestDTO dados) {
        if (dados == null) {
            throw new ValidationException("Dados da promoção são obrigatórios");
        }
        Promocao promocao = promocaoService.atualizar(id, PromocaoMapper.toEntity(dados), dados.droneIds());
        return Response.ok(PromocaoMapper.toResponseDTO(promocao)).build();
    }

    @DELETE
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    @Transactional
    public Response deletar(@PathParam("id") Long id) {
        promocaoService.deletar(id);
        return Response.noContent().build();
    }
}