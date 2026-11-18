package drones.services;

import drones.model.drones.DroneImageStorage;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;

/**
 * Inicializa o provedor de armazenamento de imagens na subida da aplicação.
 */
@ApplicationScoped
public class DroneImageStorageInitializer {

    @Inject
    DroneImageStorage droneImageStorage;

    void onStart(@Observes StartupEvent event) {
        droneImageStorage.inicializar();
    }
}
