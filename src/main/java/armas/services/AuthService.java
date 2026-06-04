package armas.services;

import armas.dto.auth.AuthRequestDTO;
import armas.dto.auth.AuthResponseDTO;
import armas.model.usuario.Usuario;
import armas.repository.UsuarioRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response.Status;

@ApplicationScoped
public class AuthService implements AuthServiceInterface {

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    HashService hashService;

    @Inject
    JwtService jwtService;

    @Override
    public AuthResponseDTO login(AuthRequestDTO dto) {
        // Busca o usuario pelo login; retorna 401 se nao encontrado
        Usuario usuario = usuarioRepository.findByLogin(dto.login())
                .orElseThrow(() -> new WebApplicationException("Login ou senha invalidos", Status.UNAUTHORIZED));

        // Verifica se a senha fornecida bate com o hash armazenado
        if (!hashService.verificarBcrypt(dto.senha(), usuario.getSenhaHash())) {
            throw new WebApplicationException("Login ou senha invalidos", Status.UNAUTHORIZED);
        }

        String token = jwtService.gerarToken(usuario);
        return new AuthResponseDTO(token, "Bearer");
    }
}