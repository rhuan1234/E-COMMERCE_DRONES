package drones.resources;

import org.eclipse.microprofile.jwt.JsonWebToken;

import drones.dto.pedidos.PagamentoCartaoRequestDTO;
import drones.exception.ValidationException;
import drones.mapper.PagamentoCartaoMapper;
import drones.mapper.PagamentoPixMapper;
import drones.model.pedido.PagamentoCartao;
import drones.model.pedido.PagamentoPix;
import drones.services.PagamentoCartaoServiceInterface;
import drones.services.PagamentoPixServiceInterface;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@ApplicationScoped
@Path("/pedidos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PagamentoController {

    @Inject
    PagamentoCartaoServiceInterface pagamentoCartaoService;

    @Inject
    PagamentoPixServiceInterface pagamentoPixService;

    @Inject
    JsonWebToken jwt;

    @POST
    @Path("/{pedidoId}/pagamento/cartao")
    @Transactional
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response criarPagamentoCartao(@PathParam("pedidoId") Long pedidoId, @Valid PagamentoCartaoRequestDTO dto) {

        if (pedidoId == null || pedidoId <= 0) {
            throw new ValidationException(
                "Id do pedido inválido",
                "pedidoId"
            );
        }

        if (dto == null) {
            throw new ValidationException(
                "Dados do pagamento são obrigatórios"
            );
        }

        String login = jwt.getName();

        if (login == null || login.isBlank()) {
            throw new ValidationException(
                "Usuário não autenticado"
            );
        }

        PagamentoCartao pagamentoCartao =
            pagamentoCartaoService.criar(
                PagamentoCartaoMapper.toEntity(dto),
                pedidoId,
                login
            );

        return Response.status(Response.Status.CREATED)
                .entity(
                    PagamentoCartaoMapper.toResponseDTO(
                        pagamentoCartao
                    )
                )
                .build();
    }

    @POST
    @Path("/{pedidoId}/pagamento/pix")
    @Transactional
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response criarPagamentoPix(@PathParam("pedidoId") Long pedidoId) {

        if (pedidoId == null || pedidoId <= 0) {
            throw new ValidationException(
                "Id do pedido inválido",
                "pedidoId"
            );
        }

        String login = jwt.getName();

        if (login == null || login.isBlank()) {
            throw new ValidationException(
                "Usuário não autenticado"
            );
        }

        PagamentoPix pagamentoPix =
            pagamentoPixService.criar(
                pedidoId,
                login
            );

        return Response.status(Response.Status.CREATED)
                .entity(
                    PagamentoPixMapper.toResponseDTO(
                        pagamentoPix
                    )
                )
                .build();
    }

    @GET
    @Path("/pagamentos/pix/{id}")
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response obterPagamentoPix(@PathParam("id") Long id) {

        if (id == null || id <= 0) {
            throw new ValidationException(
                "Id do pagamento inválido",
                "id"
            );
        }

        String login = jwt.getName();

        if (login == null || login.isBlank()) {
            throw new ValidationException(
                "Usuário não autenticado"
            );
        }

        PagamentoPix pagamentoPix =
            pagamentoPixService.buscarPorId(id, login);

        if (pagamentoPix == null) {
            throw new NotFoundException(
                "Pagamento PIX não encontrado"
            );
        }

        return Response.ok(
                PagamentoPixMapper.toResponseDTO(
                    pagamentoPix
                )
        ).build();
    }

    @GET
    @Path("/pagamentos/cartao/{id}")
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response obterPagamentoCartao( @PathParam("id") Long id) {

        if (id == null || id <= 0) {
            throw new ValidationException(
                "Id do pagamento inválido",
                "id"
            );
        }

        String login = jwt.getName();

        if (login == null || login.isBlank()) {
            throw new ValidationException(
                "Usuário não autenticado"
            );
        }

        PagamentoCartao pagamentoCartao =
            pagamentoCartaoService.buscarPorId(id, login);

        if (pagamentoCartao == null) {
            throw new NotFoundException(
                "Pagamento cartão não encontrado"
            );
        }

        return Response.ok(
                PagamentoCartaoMapper.toResponseDTO(
                    pagamentoCartao
                )
        ).build();
    }

    @GET
    @Path("/{pedidoId}/pagamentos/pix")
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response obterPagamentosPixPorPedido(@PathParam("pedidoId") Long pedidoId) {

        if (pedidoId == null || pedidoId <= 0) {
            throw new ValidationException(
                "Id do pedido inválido",
                "pedidoId"
            );
        }

        String login = jwt.getName();

        if (login == null || login.isBlank()) {
            throw new ValidationException(
                "Usuário não autenticado"
            );
        }

        return Response.ok(
                pagamentoPixService
                    .buscarPorPedidoId(pedidoId, login)
                    .stream()
                    .map(PagamentoPixMapper::toResponseDTO)
                    .toList()
        ).build();
    }

    @GET
    @Path("/{pedidoId}/pagamentos/cartao")
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response obterPagamentosCartaoPorPedido(@PathParam("pedidoId") Long pedidoId) {

        if (pedidoId == null || pedidoId <= 0) {
            throw new ValidationException(
                "Id do pedido inválido",
                "pedidoId"
            );
        }

        String login = jwt.getName();

        if (login == null || login.isBlank()) {
            throw new ValidationException(
                "Usuário não autenticado"
            );
        }

        return Response.ok(
                pagamentoCartaoService
                    .buscarPorPedidoId(pedidoId, login)
                    .stream()
                    .map(PagamentoCartaoMapper::toResponseDTO)
                    .toList()
        ).build();
    }

    @PATCH
    @Path("/pagamentos/pix/{id}/pagar")
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response pagarPix(@PathParam("id") Long id) {

        if (id == null || id <= 0) {
            throw new ValidationException(
                "Id do pagamento inválido",
                "id"
            );
        }

        String login = jwt.getName();

        if (login == null || login.isBlank()) {
            throw new ValidationException(
                "Usuário não autenticado"
            );
        }

        pagamentoPixService.pagarPix(id, login);

        return Response.noContent().build();
    }

    @PATCH
    @Path("/pagamentos/cartao/{id}/pagar")
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response pagarCartao(@PathParam("id") Long id) {

        if (id == null || id <= 0) {
            throw new ValidationException(
                "Id do pagamento inválido",
                "id"
            );
        }

        String login = jwt.getName();

        if (login == null || login.isBlank()) {
            throw new ValidationException(
                "Usuário não autenticado"
            );
        }

        pagamentoCartaoService.pagarCartao(id, login);

        return Response.noContent().build();
    }

    @PATCH
    @Path("/pagamentos/cartao/{id}/cancelar")
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response cancelarPagamentoCartao(@PathParam("id") Long id) {

        if (id == null || id <= 0) {
            throw new ValidationException(
                "Id do pagamento inválido",
                "id"
            );
        }

        String login = jwt.getName();

        if (login == null || login.isBlank()) {
            throw new ValidationException(
                "Usuário não autenticado"
            );
        }

        pagamentoCartaoService.cancelarCartao(id, login);

        return Response.noContent().build();
    }

    @PATCH
    @Path("/pagamentos/pix/{id}/cancelar")
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response cancelarPagamentoPix(@PathParam("id") Long id) {

        if (id == null || id <= 0) {
            throw new ValidationException(
                "Id do pagamento inválido",
                "id"
            );
        }

        String login = jwt.getName();

        if (login == null || login.isBlank()) {
            throw new ValidationException(
                "Usuário não autenticado"
            );
        }

        pagamentoPixService.cancelarPix(id, login);

        return Response.noContent().build();
    }
}