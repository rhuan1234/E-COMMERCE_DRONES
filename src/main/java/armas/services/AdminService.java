package armas.services;

import java.util.List;

import armas.dto.usuarios.AlterarSenhaAdminDTO;
import armas.exception.ValidationException;
import armas.model.usuario.Usuario;
import armas.repository.UsuarioRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response.Status;

@ApplicationScoped
public class AdminService implements AdminServiceInterface {

    @Inject
    UsuarioRepository repository;

    @Inject
    HashService hashService;

    @Override
    public List<Usuario> buscarTodos() {
        return repository.findAll().list();
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
    public Usuario criar(Usuario usuario) {
        // Verifica se o login ja existe
        if (repository.findByLogin(usuario.getLogin()).isPresent()) {
            throw new WebApplicationException("Login ja existe", Status.BAD_REQUEST);
        }

        // Gera o hash da senha com BCrypt
        usuario.setSenhaHash(hashService.bcrypt(usuario.getSenhaHash()));
        repository.persist(usuario);
        return usuario;
    }

  

    @Override
    @Transactional
    public void deletar(Long id) {
        Usuario u = buscarPorId(id);
        repository.delete(u);
    }

    @Override
    @Transactional
    public void alterarSenha(AlterarSenhaAdminDTO dto) {
        String login = dto.login();
        if (login == null || login.isBlank()) {
            throw new ValidationException("Usuário não autenticado");
        }
        if (dto.senhaAtual() == null || dto.senhaAtual().isBlank()) {
            throw new ValidationException("Senha atual não pode estar vazia");
        }
        if (dto.novaSenha() == null || dto.novaSenha().isBlank()) {
            throw new ValidationException("Nova senha não pode estar vazia");
        }

        Usuario usuario = buscarPorLogin(login);
        if (usuario == null) {
            throw new ValidationException("Usuário não encontrado");
        }

        // Verifica se a senha atual está correta
        if (!hashService.verificarBcrypt(dto.senhaAtual(), usuario.getSenhaHash())) {
            throw new ValidationException("Senha atual está incorreta");
        }

        // Gera o hash da nova senha com BCrypt
        usuario.setSenhaHash(hashService.bcrypt(dto.novaSenha()));
        repository.persist(usuario);
    }
}