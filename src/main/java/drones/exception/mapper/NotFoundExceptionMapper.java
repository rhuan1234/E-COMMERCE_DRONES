package drones.exception.mapper;

import drones.exception.ProblemDetail;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class NotFoundExceptionMapper implements ExceptionMapper<NotFoundException> {

    @Context
    UriInfo uriInfo;

    @Override
    public Response toResponse(NotFoundException exception) {
        ProblemDetail problemDetail = new ProblemDetail(
            404,
            "Not Found",
            exception.getMessage() != null ? exception.getMessage() : "O recurso não foi encontrado."
        );

        problemDetail.setType("http://localhost:8080/errors/resource-not-found");

        if (uriInfo != null) {
            problemDetail.setInstance(uriInfo.getPath());
        }

        return Response
            .status(404)
            .entity(problemDetail)
            .type("application/problem+json")
            .build();
    }
}
