package drones.exception.mapper;

import drones.exception.ProblemDetail;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class WebApplicationExceptionMapper implements ExceptionMapper<WebApplicationException> {

    @Context
    UriInfo uriInfo;

    @Override
    public Response toResponse(WebApplicationException exception) {
        Response original = exception.getResponse();
        int status = original != null ? original.getStatus() : 500;
        String title = original != null && original.getStatusInfo() != null
            ? original.getStatusInfo().getReasonPhrase()
            : "Error";
        String detail = exception.getMessage() != null
            ? exception.getMessage()
            : "Ocorreu um erro ao processar a requisição.";

        ProblemDetail problemDetail = new ProblemDetail(
            status,
            title,
            detail
        );

        problemDetail.setType("http://localhost:8080/errors/http-error");

        if (uriInfo != null) {
            problemDetail.setInstance(uriInfo.getPath());
        }

        return Response
            .status(status)
            .entity(problemDetail)
            .type("application/problem+json")
            .build();
    }
}
