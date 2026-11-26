package drones.exception.mapper;

import drones.exception.ProblemDetail;
import io.quarkus.security.ForbiddenException;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class ForbiddenExceptionMapper implements ExceptionMapper<ForbiddenException> {

    @Context
    UriInfo uriInfo;

    @Override
    public Response toResponse(ForbiddenException exception) {
        ProblemDetail problemDetail = new ProblemDetail(
            403,
            "Acesso negado",
            "Você não tem permissão para acessar este recurso."
        );

        problemDetail.setType("http://localhost:8080/errors/forbidden");

        if (uriInfo != null) {
            problemDetail.setInstance(uriInfo.getPath());
        }

        return Response
            .status(403)
            .entity(problemDetail)
            .type("application/problem+json")
            .build();
    }
}
