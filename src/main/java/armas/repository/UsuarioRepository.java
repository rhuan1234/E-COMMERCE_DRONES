package armas.repository;

import java.util.Optional;

import armas.model.usuario.Usuario;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class UsuarioRepository implements PanacheRepository<Usuario> {

    public Optional<Usuario> findByLogin(String login) {
        return find("login", login).firstResultOptional();
    }

    public Usuario findByEmail(String email) {
        return find("email", email).firstResult();
    }
}