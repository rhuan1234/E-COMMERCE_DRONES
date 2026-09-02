package drones.repository;

import drones.model.drones.Camera;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CameraRepository implements PanacheRepository<Camera> {
}