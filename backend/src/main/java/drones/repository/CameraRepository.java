package drones.repository;

import drones.model.drones.Camera;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CameraRepository implements PanacheRepository<Camera> {

    public PanacheQuery<Camera> findByModelo(String modelo) {
        return find("modelo.nome ILIKE ?1", "%" + modelo + "%");
    }
}