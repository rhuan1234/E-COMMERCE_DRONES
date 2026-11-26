package drones.exception.mapper;

import drones.exception.ProblemDetail;
import io.quarkus.security.UnauthorizedException;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class SecurityUnauthorizedExceptionMapper implements ExceptionMapper<UnauthorizedException> {

    @Context
    UriInfo uriInfo;

    @Override
    public Response toResponse(UnauthorizedException exception) {
        ProblemDetail problemDetail = new ProblemDetail(
            401,
            "Não autorizado",
            "Autenticação necessária ou sessão expirada."
        );

        problemDetail.setType("http://localhost:8080/errors/unauthorized");

        if (uriInfo != null) {
            problemDetail.setInstance(uriInfo.getPath());
        }

        return Response
            .status(401)
            .entity(problemDetail)
            .type("application/problem+json")
            .build();
    }
}
