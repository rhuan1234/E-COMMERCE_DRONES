package drones.repository;

import java.util.Optional;
import java.util.UUID;

import drones.model.usuario.Usuario;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class UsuarioRepository implements PanacheRepository<Usuario> {

    public Optional<Usuario> findByLogin(String login) {
        return find("login", login).firstResultOptional();
    }

    public Usuario findByEmail(String email) {
        return find("email", email).firstResult();
    }

     @Transactional
    public boolean softDelete(Long id) {
        Usuario usuario = find("id = ?1 and ativo = true", id)
                .firstResult();

        if (usuario == null) {
            return false;
        }

        String identificador = UUID.randomUUID().toString();

        usuario.setEmail("deleted_" + identificador + "@invalid.local");
        usuario.setLogin("deleted_" + identificador);
        usuario.setAtivo(false);

        return true;
    }
}