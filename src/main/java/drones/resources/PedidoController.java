package drones.resources;

import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

import org.eclipse.microprofile.jwt.JsonWebToken;

import drones.dto.pedidos.PedidoRequestDTO;
import drones.dto.pedidos.PedidoResponseAnaliseAdminDTO;
import drones.dto.pedidos.PedidoResponseDTO;
import drones.exception.ValidationException;
import drones.mapper.PedidoMapper;
import drones.model.pedido.Pedido;
import drones.model.usuario.Usuario;
import drones.services.AdminServiceInterface;
import drones.services.PedidoService;

@ApplicationScoped
@Path("/pedidos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PedidoController {

    @Inject
    PedidoService pedidoService;

    @Inject
    JsonWebToken jwt;

    @Inject
    AdminServiceInterface usuarioService;

    @POST
    @RolesAllowed({"CLIENTE", "ADMIN"})
    @Transactional
    public Response criar(@Valid PedidoRequestDTO dto) {

        if (dto == null) {
            throw new ValidationException("Dados do pedido são obrigatórios");
        }

        String login = jwt.getName();

        if (login == null || login.isBlank()) {
            throw new ValidationException("Usuário não autenticado");
        }

        Usuario usuario = usuarioService.buscarPorLogin(login);

        if (usuario == null) {
            throw new NotFoundException("Usuário não encontrado");
        }

        Pedido pedido = PedidoMapper.toEntity(dto);

        Pedido pedidoCriado = pedidoService.criar(usuario, pedido);

        return Response.status(Response.Status.CREATED)
                .entity(
                    PedidoMapper.toResponseDTO(pedidoCriado)
                )
                .build();
    }

    @GET
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public Response listarTodos() {

        List<PedidoResponseDTO> pedidos =
            pedidoService.buscarTodos()
                .stream()
                .map(PedidoMapper::toResponseDTO)
                .toList();

        return Response.ok(pedidos).build();
    }

    @GET
    @RolesAllowed({"ADMIN", "CLIENTE"})
    public Response listarTodosEcommerce() {

        String login = jwt.getName();

        if (login == null || login.isBlank()) {
            throw new ValidationException("Usuário não autenticado");
        }

        Usuario usuario =
            usuarioService.buscarPorLogin(login);

        if (usuario == null) {
            throw new NotFoundException("Usuário não encontrado");
        }

        List<PedidoResponseDTO> pedidos =
            pedidoService.buscarPorUsuarioId(usuario.getId())
            .stream()
            .map(PedidoMapper::toResponseDTO)
            .toList();

        return Response.ok(pedidos).build();
    }

    @GET
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response obterPorId(
            @PathParam("id") Long id) {

        if (id == null || id <= 0) {
            throw new ValidationException("Id do pedido inválido","id"
            );
        }

        Pedido pedido = pedidoService.buscarPorId(id);

        if (pedido == null) {
            throw new NotFoundException("Pedido não encontrado");
        }

        return Response.ok(PedidoMapper.toResponseDTO(pedido)
        ).build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"ADMIN", "CLIENTE"})
    public Response obterPorIdEcommerce(
            @PathParam("id") Long id) {

        if (id == null || id <= 0) {
            throw new ValidationException("Id do pedido inválido","id");
        }

        String login = jwt.getName();

        if (login == null || login.isBlank()) {
            throw new ValidationException("Usuário não autenticado");
        }

        Pedido pedido = pedidoService.buscarPorId(id);

        if (pedido == null) {
            throw new NotFoundException("Pedido não encontrado");
        }

        if (!pedido.getUsuario()
                .getLogin()
                .equals(login)) {

            throw new NotFoundException("Pedido não encontrado");
        }

        return Response.ok(
                PedidoMapper.toResponseDTO(
                    pedido
                )
        ).build();
    }

    @GET
    @Path("/admin/usuario/{usuarioId}")
    @RolesAllowed("ADMIN")
    public Response listarPedidosPorUsuario(@PathParam("usuarioId") Long usuarioId) {

        if (usuarioId == null || usuarioId <= 0) {
            throw new ValidationException("Id do usuário inválido","usuarioId");
        }

        List<PedidoResponseDTO> pedidos =
            pedidoService.buscarPorUsuarioId(usuarioId)
                .stream()
                .map(PedidoMapper::toResponseDTO)
                .toList();

        return Response.ok(pedidos).build();
    }


    @DELETE
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    @Transactional
    public Response deletar(@PathParam("id") Long id) {

        if (id == null || id <= 0) {
            throw new ValidationException("Id do pedido inválido","id");
        }

        String login = jwt.getName();

        if (login == null || login.isBlank()) {
            throw new ValidationException("Usuário não autenticado","login");
        }

        if (pedidoService.deletar(id, login)) {
            return Response
                    .status(Response.Status.NO_CONTENT)
                    .build();
        }

        throw new NotFoundException("Pedido não encontrado");
    }

    @PATCH
    @Path("/{id}/cancelar")
    @RolesAllowed({"ADMIN", "CLIENTE"})
    @Transactional
    public Response cancelar(@PathParam("id") Long id) {

        if (id == null || id <= 0) {
            throw new ValidationException(
                "Id do pedido inválido",
                "id"
            );
        }

        String login = jwt.getName();

        if (login == null || login.isBlank()) {
            throw new ValidationException(
                "Usuário não autenticado"
            );
        }

        Pedido pedido =
            pedidoService.cancelar(id, login);

        if (pedido == null) {
            throw new NotFoundException(
                "Pedido não encontrado"
            );
        }

        return Response.ok(PedidoMapper.toResponseDTO(pedido)).build();
    }

    @GET
    @Path("/status/{status}")
    @RolesAllowed({"ADMIN", "CLIENTE"})
    public Response listarPedidosPorStatus(@PathParam("status") String status) {

        if (status == null || status.isBlank()) {
            throw new ValidationException(
                "Status do pedido é obrigatório",
                "status"
            );
        }

        String login = jwt.getName();

        if (login == null || login.isBlank()) {
            throw new ValidationException(
                "Usuário não autenticado"
            );
        }

        List<PedidoResponseDTO> pedidos =
            pedidoService.findByStatus(status, login)
                .stream()
                .map(PedidoMapper::toResponseDTO)
                .toList();

        return Response.ok(pedidos).build();
    }

    @PATCH
    @Path("/admin/aprovar-pedido/{id}")
    @RolesAllowed("ADMIN")
    @Transactional
    public Response aprovarPedido(@PathParam("id") Long id) {
        if (id == null || id <= 0) {
            throw new ValidationException(
                "Id do pedido inválido",
                "id"
            );
        }

        Pedido pedido = pedidoService.aprovarPedido(id);

        if (pedido == null) {
            throw new NotFoundException(
                "Pedido não encontrado"
            );
        }

        return Response.ok(PedidoMapper.toResponseDTO(pedido)).build();
    }
    
    @PATCH
    @Path("/admin/reprovar-pedido/{id}")
    @RolesAllowed("ADMIN")
    @Transactional
    public Response reprovarPedido(@PathParam("id") Long id) {
        if (id == null || id <= 0) {
            throw new ValidationException( "Id do pedido inválido","id"
            );
        }
        Pedido pedido = pedidoService.reprovarPedido(id);
        if (pedido == null) {
            throw new NotFoundException("Pedido não encontrado");
        }
        return Response.ok(PedidoMapper.toResponseDTO(pedido)).build();
    }

    @GET
    @Path("/admin/pendentes")
    @RolesAllowed("ADMIN")
    public Response listarPedidosPendentes() {
        List<Pedido> pedidos = pedidoService.listarPedidosPendentes();
        List<PedidoResponseAnaliseAdminDTO> dtos = pedidos.stream()
                .map(PedidoMapper::toResponseAnaliseAdminDTO)
                .toList();
        return Response.ok(dtos).build();
    }
}