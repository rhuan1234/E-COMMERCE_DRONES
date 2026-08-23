package drones.services;

import java.util.Set;

import drones.model.usuario.Usuario;
import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class JwtService {

    // Tempo de expiração: 24 horas em segundos
    private static final long EXPIRACAO_SEGUNDOS = 24*3600L;

    /**
     * Gera um token JWT assinado para o usuario autenticado.
     * O perfil é incluido como grupo (claim "groups"), permitindo uso com @RolesAllowed.
     */
    public String gerarToken(Usuario usuario) {
        return Jwt.issuer("armas-api")
                .upn(usuario.getLogin())
                .groups(Set.of(usuario.getPerfil().name()))
                .expiresIn(EXPIRACAO_SEGUNDOS)
                .sign();
    }
}