package drones.repository;

import drones.model.drones.DroneImage;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class DroneImageRepository implements PanacheRepository<DroneImage> {

    @Transactional
    public void salvar(DroneImage imagem) {
        persist(imagem);
    }

    public DroneImage buscarPorDrone(Long imagemId, Long droneId) {
        return find("id = ?1 and drone.id = ?2", imagemId, droneId).firstResult();
    }
}
