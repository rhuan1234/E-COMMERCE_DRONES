package drones.repository;

import drones.model.drones.Marca;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class MarcaRepository implements PanacheRepository<Marca> {

    public PanacheQuery<Marca> findByNome(String nome) {
        return find("nome ILIKE ?1", "%" + nome + "%");
    }
}
