package drones.resources;

import drones.dto.auth.AuthRequestDTO;
import drones.dto.auth.AuthResponseDTO;
import drones.dto.auth.AuthUserResponseDTO;
import drones.dto.auth.LogoutRequestDTO;
import drones.dto.auth.RefreshTokenRequestDTO;
import drones.services.AuthServiceInterface;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthController {

    @Inject
    AuthServiceInterface authServiceInterface;

    @POST
    @Path("/login")
    @PermitAll
    public Response login(@Valid AuthRequestDTO dto) {
        AuthResponseDTO response = authServiceInterface.login(dto);
        return Response.ok(response).build();
    }

    @POST
    @Path("/refresh")
    @PermitAll
    public Response refresh(@Valid RefreshTokenRequestDTO dto) {
        AuthResponseDTO response = authServiceInterface.refresh(dto);
        return Response.ok(response).build();
    }

    @GET
    @Path("/me")
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response me() {
        AuthUserResponseDTO response = authServiceInterface.me();
        return Response.ok(response).build();
    }

    @POST
    @Path("/logout")
    @PermitAll
    public Response logout(LogoutRequestDTO dto) {
        authServiceInterface.logout(dto);
        return Response.noContent().build();
    }
}
