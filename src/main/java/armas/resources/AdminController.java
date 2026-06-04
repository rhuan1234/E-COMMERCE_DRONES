package armas.resources;

import java.util.List;

import armas.dto.usuarios.AlterarSenhaAdminDTO;
import armas.dto.usuarios.UsuarioRequestDTO;
import armas.dto.usuarios.UsuarioResponseDTO;
import armas.exception.ValidationException;
import armas.mapper.UsuarioMapper;
import armas.model.usuario.Usuario;
import armas.services.AdminServiceInterface;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;

@Path("/usuarios")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AdminController {

    @Inject
    AdminServiceInterface usuarioService;

    @GET
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public Response buscarTodos() {

        List<UsuarioResponseDTO> lista = usuarioService.buscarTodos()
                .stream()
                .map(UsuarioMapper::toResponseDTO)
                .toList();

        return Response.ok(lista).build();
    }

    @GET
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response buscarPeloId(@PathParam("id") Long id) {

        if (id == null || id <= 0) {
            throw new ValidationException("Id do usuário inválido",
                "id"
            );
        }

        Usuario usuario = usuarioService.buscarPorId(id);

        if (usuario == null) {
            throw new NotFoundException("Usuario não encontrado");
        }

        return Response.ok(UsuarioMapper.toResponseDTO(usuario)).build();
    }

    @GET
    @Path("/admin/login/{login}")
    @RolesAllowed("ADMIN")
    public Response buscarPeloLogin(@PathParam("login") String login) {

        if (login == null || login.isBlank()) {
            throw new ValidationException("Login do usuário é obrigatório",
                "login"
            );
        }

        Usuario usuario = usuarioService.buscarPorLogin(login);

        if (usuario == null) {
            throw new NotFoundException("Usuario não encontrado");
        }

        return Response.ok(UsuarioMapper.toResponseDTO(usuario)).build();
    }

    @POST
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public Response criar(@Valid UsuarioRequestDTO dto) {

        if (dto == null) {
            throw new ValidationException(
                "Dados do usuário são obrigatórios"
            );
        }

        Usuario usuario = UsuarioMapper.toEntity(dto);
        Usuario usuarioCriado = usuarioService.criar(usuario);

        return Response.status(Status.CREATED)
                .entity(UsuarioMapper.toResponseDTO(usuarioCriado))
                .build();
    }

    @PUT
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response atualizar(@PathParam("id") Long id, @Valid UsuarioRequestDTO dto) {

        if (id == null || id <= 0) {
            throw new ValidationException(
                "Id do usuário inválido",
                "id"
            );
        }

        if (dto == null) {
            throw new ValidationException(
                "Dados do usuário são obrigatórios"
            );
        }

        Usuario usuario = UsuarioMapper.toEntity(dto);
        usuarioService.atualizar(id, usuario);
        Usuario usuarioAtualizado = usuarioService.buscarPorId(id);

        return Response.ok(UsuarioMapper.toResponseDTO(usuarioAtualizado)).build();
    }

    @DELETE
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response deletar(@PathParam("id") Long id) {

        if (id == null || id <= 0) {
            throw new ValidationException(
                "Id do usuário inválido",
                "id"
            );
        }

        usuarioService.deletar(id);

        return Response.noContent().build();
    }

    @PATCH
    @Path("/admin/senha")
    @RolesAllowed("ADMIN")
    public Response alterarSenha(@Valid AlterarSenhaAdminDTO dto) {

        if (dto == null) {
            throw new ValidationException(
                "Dados da senha são obrigatórios"
            );
        }

        usuarioService.alterarSenha(dto);

        return Response.ok().build();
    }


}
