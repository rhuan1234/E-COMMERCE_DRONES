package armas.exception.mapper;

import armas.exception.ProblemDetail;
import armas.exception.UnauthorizedException;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class UnauthorizedExceptionMapper implements ExceptionMapper<UnauthorizedException> {

    @Context
    UriInfo uriInfo;

    @Override
    public Response toResponse(UnauthorizedException exception) {
        ProblemDetail problemDetail = new ProblemDetail(
            401,
            "Não autorizado",
            exception.getMessage() != null ? exception.getMessage() : "Usuário não autenticado."
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
