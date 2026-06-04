package armas.repository;

import armas.model.usuario.TokenResetarSenha;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class tokenRepository implements PanacheRepository<TokenResetarSenha> {
    public TokenResetarSenha findByToken(String token) {
        return find("token", token).firstResult();
    }

}
