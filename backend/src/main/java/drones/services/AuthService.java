package drones.services;

import java.util.Optional;
import java.util.Set;

import drones.dto.auth.AuthRequestDTO;
import drones.dto.auth.AuthResponseDTO;
import drones.dto.auth.AuthUserResponseDTO;
import drones.dto.auth.LogoutRequestDTO;
import drones.dto.auth.RefreshTokenRequestDTO;
import drones.exception.UnauthorizedException;
import drones.model.usuario.Perfil;
import drones.model.usuario.Usuario;
import drones.repository.UsuarioRepository;
import drones.security.AuthenticatedUserResolver;
import drones.services.KeycloakIdentityProvider.KeycloakTokenClaims;
import drones.services.KeycloakIdentityProvider.KeycloakTokenResult;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class AuthService implements AuthServiceInterface {

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    KeycloakIdentityProvider keycloakIdentityProvider;

    @Inject
    AuthenticatedUserResolver authenticatedUserResolver;

    @Override
    @Transactional
    public AuthResponseDTO login(AuthRequestDTO dto) {
        KeycloakTokenResult tokens = keycloakIdentityProvider.authenticate(dto.login(), dto.senha());
        KeycloakTokenClaims claims = keycloakIdentityProvider.extractClaims(tokens.accessToken());
        Usuario usuario = sincronizarUsuarioAutenticado(claims, tokens.refreshToken());

        return new AuthResponseDTO(
                tokens.accessToken(),
                tokens.tokenType(),
                tokens.refreshToken(),
                tokens.expiresIn(),
                toAuthUserDTO(usuario, resolverRoles(usuario, claims.roles()))
        );
    }

    @Override
    @Transactional
    public AuthResponseDTO refresh(RefreshTokenRequestDTO dto) {
        KeycloakTokenResult tokens = keycloakIdentityProvider.refreshToken(dto.refreshToken());
        KeycloakTokenClaims claims = keycloakIdentityProvider.extractClaims(tokens.accessToken());
        Usuario usuario = sincronizarUsuarioAutenticado(claims, tokens.refreshToken());

        return new AuthResponseDTO(
                tokens.accessToken(),
                tokens.tokenType(),
                tokens.refreshToken(),
                tokens.expiresIn(),
                toAuthUserDTO(usuario, resolverRoles(usuario, claims.roles()))
        );
    }

    @Override
    public AuthUserResponseDTO me() {
        String login = authenticatedUserResolver.getLogin();
        Optional<String> keycloakIdOpt = authenticatedUserResolver.getKeycloakId();

        Usuario usuario = keycloakIdOpt
                .flatMap(usuarioRepository::findByKeycloakId)
                .or(() -> usuarioRepository.findByLogin(login))
                .orElseThrow(() -> new UnauthorizedException("Usuário não encontrado ou sessão inválida"));

        if (!usuario.isAtivo()) {
            throw new UnauthorizedException("Usuário inativo");
        }

        return toAuthUserDTO(usuario, resolverRoles(usuario, authenticatedUserResolver.getRoles()));
    }

    @Override
    public void logout(LogoutRequestDTO dto) {
        if (dto != null && dto.refreshToken() != null && !dto.refreshToken().isBlank()) {
            keycloakIdentityProvider.logout(dto.refreshToken());
            return;
        }

        if (authenticatedUserResolver.isAuthenticated()) {
            Optional<String> keycloakId = authenticatedUserResolver.getKeycloakId()
                    .or(() -> usuarioRepository.findByLogin(authenticatedUserResolver.getLogin())
                            .map(Usuario::getKeycloakId));
            keycloakId.ifPresent(keycloakIdentityProvider::logoutUserSessions);
        }
    }

    private Usuario sincronizarUsuarioAutenticado(KeycloakTokenClaims claims, String refreshToken) {
        Optional<Usuario> usuarioOpt = Optional.empty();
        if (claims.keycloakId() != null && !claims.keycloakId().isBlank()) {
            usuarioOpt = usuarioRepository.findByKeycloakId(claims.keycloakId());
        }
        if (usuarioOpt.isEmpty() && claims.username() != null && !claims.username().isBlank()) {
            usuarioOpt = usuarioRepository.findByLogin(claims.username());
        }

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            if (!usuario.isAtivo()) {
                try {
                    keycloakIdentityProvider.logout(refreshToken);
                } catch (RuntimeException ignored) {
                    // Melhor esforço para invalidar sessão recém-aberta
                }
                throw new UnauthorizedException("Usuário inativo");
            }
            if ((usuario.getKeycloakId() == null || usuario.getKeycloakId().isBlank())
                    && claims.keycloakId() != null && !claims.keycloakId().isBlank()) {
                usuario.setKeycloakId(claims.keycloakId());
            }
            return usuario;
        }

        Usuario novo = new Usuario();
        novo.setKeycloakId(claims.keycloakId());
        novo.setLogin(claims.username());
        novo.setEmail(claims.email() != null && !claims.email().isBlank()
                ? claims.email()
                : claims.username() + "@local.invalid");
        novo.setNomeCompleto(claims.fullName());
        novo.setPerfil(claims.roles().contains(Perfil.ADMIN.name()) ? Perfil.ADMIN : Perfil.CLIENTE);
        novo.setAtivo(true);
        usuarioRepository.persist(novo);
        return novo;
    }

    private Set<String> resolverRoles(Usuario usuario, Set<String> tokenRoles) {
        if (tokenRoles != null && !tokenRoles.isEmpty()) {
            Set<String> appRoles = tokenRoles.stream()
                    .filter(r -> Perfil.ADMIN.name().equals(r) || Perfil.CLIENTE.name().equals(r))
                    .collect(java.util.stream.Collectors.toSet());
            if (!appRoles.isEmpty()) {
                return appRoles;
            }
        }
        return usuario.getPerfil() != null ? Set.of(usuario.getPerfil().name()) : Set.of();
    }

    private AuthUserResponseDTO toAuthUserDTO(Usuario usuario, Set<String> roles) {
        return new AuthUserResponseDTO(
                usuario.getId(),
                usuario.getKeycloakId(),
                usuario.getLogin(),
                usuario.getEmail(),
                usuario.getNomeCompleto(),
                usuario.getPerfil(),
                roles
        );
    }
}
