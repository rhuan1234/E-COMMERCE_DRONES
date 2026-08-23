package drones.resources;


import java.util.List;

import org.eclipse.microprofile.jwt.JsonWebToken;

import drones.dto.fornecedores.EnderecoRequestClienteDTO;
import drones.dto.fornecedores.EnderecoResponseClienteDTO;
import drones.dto.usuarios.AlterarSenhaClienteDTO;
import drones.dto.usuarios.ClienteRequestCompletoDTO;
import drones.dto.usuarios.ClienteRequestSimplesDTO;
import drones.dto.usuarios.ClienteResponseCompletoDTO;
import drones.dto.usuarios.EsqueceuSenhaDTO;
import drones.dto.usuarios.ResetarSenhaDTO;
import drones.exception.UnauthorizedException;
import drones.exception.ValidationException;
import drones.mapper.ClienteMapper;
import drones.model.usuario.Usuario;
import drones.services.AdminServiceInterface;
import drones.services.ClienteServiceInterface;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;

@Path("/clientes")
@Produces("application/json")
@Consumes("application/json")
public class ClienteController {
    @Inject
    ClienteServiceInterface clienteService;

    @Inject
    AdminServiceInterface usuarioService;



    @Inject
    JsonWebToken jwt;

    @Inject
    SecurityIdentity securityIdentity;



    @POST
    @PermitAll
    public Response criar(@Valid ClienteRequestSimplesDTO dto) {

        if (dto == null) {
            throw new ValidationException(
                "Dados do cliente são obrigatórios"
            );
        }

        Usuario usuarioCriado = clienteService.criar(dto);

        return Response.status(Status.CREATED)
                .entity(ClienteMapper.toResponseCompletoDTO(usuarioCriado))
                .build();
    }

    @PUT
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response atualizar(@Valid ClienteRequestCompletoDTO dto) {

        if (dto == null) {
            throw new ValidationException(
                "Dados do cliente são obrigatórios"
            );
        }

        String login = jwt.getName();

        if (login == null || login.isBlank()) {
            throw new UnauthorizedException(
                "Usuário não autenticado"
            );
        }

        ClienteResponseCompletoDTO usuarioAtualizado = clienteService.atualizar(login, dto);

        return Response.ok(usuarioAtualizado).build();
    }

    @GET
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response obterDados() {

        String login = jwt.getName();

        if (login == null || login.isBlank()) {
            throw new UnauthorizedException(
                "Usuário não autenticado"
            );
        }

        ClienteResponseCompletoDTO usuario = clienteService.obterDados(login);

        return Response.ok(usuario).build();
    }

    @PATCH
    @Path("/senha")
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response alterarSenha(@Valid AlterarSenhaClienteDTO dto) {

        if (dto == null) {
            throw new ValidationException(
                "Dados da senha são obrigatórios"
            );
        }

        String login = jwt.getName();

        if (login == null || login.isBlank()) {
            throw new UnauthorizedException(
                "Usuário não autenticado"
            );
        }

        clienteService.alterarSenha(login, dto);

        return Response.ok().build();
    }

    @POST
    @Path("/esqueci-senha")
    public Response esqueceuSenha(@Valid EsqueceuSenhaDTO dto) {

        if (dto == null) {
            throw new ValidationException(
                "Dados são obrigatórios"
            );
        }

        clienteService.enviarRecuperacao(dto.email());

        return Response.ok().build();
    }

    @POST
    @Path("/resetar-senha")
    public Response resetarSenha(@Valid ResetarSenhaDTO dto) {

        if (dto == null) {
            throw new ValidationException(
                "Dados são obrigatórios"
            );
        }

        clienteService.resetarSenha(dto);

        return Response.ok().build();
    }

    @GET
    @Path("/enderecos")
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response listarEnderecos() {

        String login = jwt.getName();

        if (login == null || login.isBlank()) {
            throw new UnauthorizedException(
                "Usuário não autenticado"
            );
        }

        List<EnderecoResponseClienteDTO> enderecos = clienteService.listarEnderecos(login);

        return Response.ok(enderecos).build();
    }

    @PUT
    @Path("/adicionar-endereco")
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response adicionarEndereco(@Valid EnderecoRequestClienteDTO dto) {

        if (dto == null) {
            throw new ValidationException(
                "Dados do endereço são obrigatórios"
            );
        }

        String login = jwt.getName();

        if (login == null || login.isBlank()) {
            throw new UnauthorizedException(
                "Usuário não autenticado"
            );
        }

        EnderecoResponseClienteDTO enderecoDTO = clienteService.adicionarEndereco(login, dto);

        return Response.ok(enderecoDTO).build();
    }

    @DELETE
    @Path("/remover-endereco/{id}")
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response removerEndereco(@PathParam("id") Long enderecoId) {

        if (enderecoId == null || enderecoId <= 0) {
            throw new ValidationException(
                "Id do endereço inválido",
                "id"
            );
        }

        String login = jwt.getName();

        if (login == null || login.isBlank()) {
            throw new UnauthorizedException(
                "Usuário não autenticado"
            );
        }

        clienteService.removerEndereco(login, enderecoId);

        return Response.ok().build();
    }

    @PUT
    @Path("/editar-endereco/{id}")
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response editarEndereco(@PathParam("id") Long enderecoId, @Valid EnderecoRequestClienteDTO dto) {

        if (enderecoId == null || enderecoId <= 0) {
            throw new ValidationException(
                "Id do endereço inválido",
                "id"
            );
        }

        if (dto == null) {
            throw new ValidationException(
                "Dados do endereço são obrigatórios"
            );
        }

        String login = jwt.getName();

        if (login == null || login.isBlank()) {
            throw new UnauthorizedException(
                "Usuário não autenticado"
            );
        }

        EnderecoResponseClienteDTO enderecoDTO = clienteService.editarEndereco(login, enderecoId, dto);

        return Response.ok(enderecoDTO).build();
    }

    @GET
    @Path("/obter-endereco-principal")
    @RolesAllowed({"CLIENTE", "ADMIN"})
    public Response obterEnderecoPrincipal() {

        String login = jwt.getName();

        if (login == null || login.isBlank()) {
            throw new UnauthorizedException(
                "Usuário não autenticado"
            );
        }

        EnderecoResponseClienteDTO enderecoDTO = clienteService.obterEnderecoPrincipal(login);

        return Response.ok(enderecoDTO).build();
    }
}
