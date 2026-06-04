package armas.resources;

import org.eclipse.microprofile.jwt.JsonWebToken;

import armas.exception.ValidationException;
import armas.services.FavoritoServiceInterface;
import armas.dto.armas.FuzilResponseEcommerceDTO;
import armas.mapper.FuzilMapperEcommerce;
import java.util.List;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Produces;
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
    @Path("/{fuzilId}")
    @Transactional
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response adicionarFavorito(@PathParam("fuzilId") Long fuzilId) {

        if (fuzilId == null || fuzilId <= 0) {
            throw new ValidationException("Id do fuzil inválido", "fuzilId");
        }

        favoritoService.salvar(loginAutenticado(), fuzilId);

        return Response.ok("Fuzil favoritado com sucesso").build();
    }

    @DELETE
    @Path("/{fuzilId}")
    @Transactional
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response removerFavorito(@PathParam("fuzilId") Long fuzilId) {

        if (fuzilId == null || fuzilId <= 0) {
            throw new ValidationException("Id do fuzil inválido", "fuzilId");
        }

        favoritoService.remover(loginAutenticado(), fuzilId);

        return Response.ok("Fuzil removido dos favoritos com sucesso").build();
    }

    @GET
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response listarFavoritos() {

        List<armas.model.armas.Favorito> favoritos = favoritoService.listarFavoritos(loginAutenticado());
        List<FuzilResponseEcommerceDTO> fuzis = favoritos.stream()
                .map(f -> FuzilMapperEcommerce.toResponseDTO(f.getFuzil()))
                .toList();

        return Response.ok(fuzis).build();
    }

    private String loginAutenticado() {
        String login = jwt.getName();
        if (login == null || login.isBlank()) {
            throw new ValidationException("Usuário não autenticado");
        }
        return login;
    }
}
