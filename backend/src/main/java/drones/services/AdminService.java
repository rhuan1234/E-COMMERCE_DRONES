package drones.services;

import java.util.List;

import drones.dto.usuarios.AlterarSenhaAdminDTO;
import drones.exception.ValidationException;
import drones.model.usuario.Perfil;
import drones.model.usuario.Usuario;
import drones.repository.UsuarioRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response.Status;

@ApplicationScoped
public class AdminService implements AdminServiceInterface {

    @Inject
    UsuarioRepository repository;

    @Inject
    KeycloakIdentityProvider keycloakIdentityProvider;

    @Override
    public List<Usuario> buscarTodos() {
        return repository.findAll().list();
    }

    @Override
    public List<Usuario> buscarTodos(int page, int pageSize) {
        return repository.find("ativo = ?1 and perfil = ?2", true, Perfil.ADMIN)
                .page(page, pageSize)
                .list();
    }

    @Override
    public List<Usuario> buscarPorLogin(int page, int pageSize, String login) {
        if (login == null || login.isBlank()) {
            throw new ValidationException("Login do usuário é obrigatório", "login");
        }
        List<Usuario> usuarios = repository.findActiveByLoginContaining(login).page(page, pageSize).list();
        if (usuarios.isEmpty()) {
            throw new ValidationException("Nenhum usuário encontrado para o login '" + login + "'", "login");
        }
        return usuarios;
    }

    @Override
    public long count() {
        return repository.count();
    }

    @Override
    public long countLogins(String login) {
        return repository.findActiveByLoginContaining(login).count();
    }

    @Override
    public Usuario buscarPorId(Long id) {
        return repository.findById(id);
    }

    @Override
    public Usuario buscarPorLogin(String login) {
        return repository.findByLogin(login)
                .orElseThrow(() -> new WebApplicationException("Usuario nao encontrado", Status.NOT_FOUND));
    }

    @Override
    @Transactional
    public Usuario criar(Usuario usuario, String senha) {
        if (repository.findByLogin(usuario.getLogin()).isPresent()) {
            throw new ValidationException("Login já cadastrado", "login");
        }
        if (usuario.getEmail() != null && repository.findByEmail(usuario.getEmail()) != null) {
            throw new ValidationException("Email já cadastrado", "email");
        }

        Perfil perfil = usuario.getPerfil() != null ? usuario.getPerfil() : Perfil.CLIENTE;
        String keycloakId = keycloakIdentityProvider.createUser(
                usuario.getLogin(),
                usuario.getEmail(),
                senha,
                usuario.getNomeCompleto(),
                perfil
        );
        usuario.setKeycloakId(keycloakId);
        usuario.setPerfil(perfil);

        try {
            repository.persist(usuario);
            repository.flush();
            return usuario;
        } catch (RuntimeException ex) {
            try {
                keycloakIdentityProvider.deleteUser(keycloakId);
            } catch (RuntimeException ignored) {
                // Compensação em caso de falha ao persistir no banco
            }
            throw ex;
        }
    }

    @Override
    @Transactional
    public void deletar(Long id) {
        Usuario usuario = repository.find("id = ?1 and ativo = true", id).firstResult();
        if (usuario == null) {
            throw new NotFoundException("Usuario não encontrado ou já desativado");
        }

        String keycloakId = usuario.getKeycloakId();
        boolean excluido = repository.softDelete(id);
        if (!excluido) {
            throw new NotFoundException("Usuario não encontrado ou já desativado");
        }

        if (keycloakId != null && !keycloakId.isBlank()) {
            keycloakIdentityProvider.disableUser(keycloakId);
            keycloakIdentityProvider.logoutUserSessions(keycloakId);
        }
    }

    @Override
    @Transactional
    public void alterarSenha(AlterarSenhaAdminDTO dto) {
        String login = dto.login();
        if (login == null || login.isBlank()) {
            throw new ValidationException("Usuário não autenticado");
        }
        if (dto.senhaAtual() == null || dto.senhaAtual().isBlank()) {
            throw new ValidationException("Senha atual não pode estar vazia", "senhaAtual");
        }
        if (dto.novaSenha() == null || dto.novaSenha().isBlank()) {
            throw new ValidationException("Nova senha não pode estar vazia", "novaSenha");
        }

        Usuario usuario = buscarPorLogin(login);
        if (usuario == null) {
            throw new ValidationException("Usuário não encontrado");
        }

        if (!keycloakIdentityProvider.verifyCredentials(login, dto.senhaAtual())) {
            throw new ValidationException("Senha atual está incorreta", "senhaAtual");
        }

        String keycloakId = resolverKeycloakId(usuario);
        keycloakIdentityProvider.updatePassword(keycloakId, dto.novaSenha());
    }

    private String resolverKeycloakId(Usuario usuario) {
        if (usuario.getKeycloakId() != null && !usuario.getKeycloakId().isBlank()) {
            return usuario.getKeycloakId();
        }
        String keycloakId = keycloakIdentityProvider.findUserIdByUsername(usuario.getLogin())
                .orElseThrow(() -> new ValidationException("Usuário não encontrado no provedor de identidade"));
        usuario.setKeycloakId(keycloakId);
        return keycloakId;
    }
}