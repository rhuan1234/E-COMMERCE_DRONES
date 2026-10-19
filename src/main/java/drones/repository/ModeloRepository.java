package drones.repository;

import drones.model.drones.Modelo;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ModeloRepository implements PanacheRepository<Modelo> {

    public PanacheQuery<Modelo> findByNome(String nome) {
        return find("nome ILIKE ?1", "%" + nome + "%");
    }

    public PanacheQuery<Modelo> findByMarcaId(Long marcaId) {
        return find("marca.id = ?1", marcaId);
    }
}
