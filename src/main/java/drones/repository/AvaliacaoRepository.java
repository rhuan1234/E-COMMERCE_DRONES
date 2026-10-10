package drones.repository;

import java.util.List;

import drones.model.drones.Avaliacao;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class AvaliacaoRepository implements PanacheRepository<Avaliacao> {

    public io.quarkus.hibernate.orm.panache.PanacheQuery<Avaliacao> findByDroneId(Long droneId) {
        return find("drone.id", droneId);
    }

    public List<Avaliacao> findByUsuarioId(Long usuarioId) {
        return list("usuario.id", usuarioId);
    }

    public Avaliacao findByUsuarioAndDrone(Long usuarioId, Long droneId) {
        return find("usuario.id = ?1 and drone.id = ?2", usuarioId, droneId)
            .firstResult();
    }
}