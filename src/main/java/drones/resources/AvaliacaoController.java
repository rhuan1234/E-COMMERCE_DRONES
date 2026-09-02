package drones.resources;

import java.util.List;

import org.eclipse.microprofile.jwt.JsonWebToken;

import drones.dto.drones.AvaliacaoRequestDTO;
import drones.dto.drones.AvaliacaoResponseDTO;
import drones.exception.UnauthorizedException;
import drones.mapper.AvaliacaoMapper;
import drones.model.drones.Avaliacao;
import drones.services.AvaliacaoServiceInterface;
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
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@ApplicationScoped
@Path("/avaliacoes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AvaliacaoController {

    @Inject
    AvaliacaoServiceInterface avaliacaoService;

    @Inject
    JsonWebToken jwt;

    @POST
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response criar(@Valid AvaliacaoRequestDTO dados) {
        Avaliacao avaliacao = avaliacaoService.criar(dados, loginAutenticado());
        return Response.status(Response.Status.CREATED).entity(AvaliacaoMapper.toResponseDTO(avaliacao)).build();
    }

    @GET
    @Path("/drone/{droneId}")
    public Response buscarPorDrone(@PathParam("droneId") Long droneId) {
        List<AvaliacaoResponseDTO> avaliacoes = avaliacaoService.buscarPorDrone(droneId).stream()
            .map(AvaliacaoMapper::toResponseDTO)
            .toList();
        return Response.ok(avaliacoes).build();
    }

    @GET
    @Path("/{id}")
    public Response buscarPorId(@PathParam("id") Long id) {
        Avaliacao avaliacao = avaliacaoService.buscarPorId(id);
        if (avaliacao == null) {
            throw new NotFoundException("Avaliação não encontrada");
        }
        return Response.ok(AvaliacaoMapper.toResponseDTO(avaliacao)).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"CLIENTE", "ADMIN"})
    @Transactional
    public Response atualizar(@PathParam("id") Long id, @Valid AvaliacaoRequestDTO dados) {
        Avaliacao avaliacao = avaliacaoService.atualizar(id, dados, loginAutenticado());
        if (avaliacao == null) {
            throw new NotFoundException("Avaliação não encontrada");
        }
        return Response.ok(AvaliacaoMapper.toResponseDTO(avaliacao)).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"CLIENTE", "ADMIN"})
    @Transactional
    public Response deletar(@PathParam("id") Long id) {
        if (!avaliacaoService.deletar(id, loginAutenticado())) {
            throw new NotFoundException("Avaliação não encontrada");
        }
        return Response.noContent().build();
    }

    private String loginAutenticado() {
        String login = jwt.getName();
        if (login == null || login.isBlank()) {
            throw new UnauthorizedException("Usuário não autenticado");
        }
        return login;
    }

}