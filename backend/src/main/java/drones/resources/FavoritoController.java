package drones.resources;

import org.eclipse.microprofile.jwt.JsonWebToken;

import drones.dto.PageResponse;
import drones.dto.drones.DroneResponseEcommerceDTO;
import drones.exception.ValidationException;
import drones.mapper.DroneMapper;
import drones.services.FavoritoServiceInterface;

import java.util.List;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Response;

@Path("/favoritos")
@Produces(MediaType.APPLICATION_JSON)
public class FavoritoController {
    @Inject
    JsonWebToken jwt;

    @Inject
    FavoritoServiceInterface favoritoService;

    @POST
    @Path("/{droneId}")
    @Transactional
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response adicionarFavorito(@PathParam("droneId") Long droneId) {

        if (droneId == null || droneId <= 0) {
            throw new ValidationException("Id do drone inválido", "droneId");
        }

        favoritoService.salvar(loginAutenticado(), droneId);

        return Response.ok("Drone favoritado com sucesso").build();
    }

    @DELETE
    @Path("/{droneId}")
    @Transactional
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response removerFavorito(@PathParam("droneId") Long droneId) {

        if (droneId == null || droneId <= 0) {
            throw new ValidationException("Id do drone inválido", "droneId");
        }

        favoritoService.remover(loginAutenticado(), droneId);

        return Response.ok("Drone removido dos favoritos com sucesso").build();
    }

    @GET
    @Path("/listar")
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public PageResponse<DroneResponseEcommerceDTO> listarFavoritos(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("pageSize") @DefaultValue("10") int pageSize) {

        List<drones.model.drones.Favorito> favoritos = favoritoService.listarFavoritos(loginAutenticado(), page, pageSize);
        long totalItems = favoritoService.countFavoritos(loginAutenticado());

        return PageResponse.of(favoritos, page, pageSize, totalItems, d -> DroneMapper.toResponseEcommerceDTO(d.getDrone()));
    }

    private String loginAutenticado() {
        String login = jwt.getName();
        if (login == null || login.isBlank()) {
            throw new ValidationException("Usuário não autenticado");
        }
        return login;
    }
}
