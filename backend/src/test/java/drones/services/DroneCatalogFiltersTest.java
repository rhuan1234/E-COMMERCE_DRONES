package drones.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;

import drones.dto.drones.DroneCatalogFilters;
import drones.exception.ValidationException;
import drones.model.drones.Camera;
import drones.model.drones.Drone;
import drones.model.drones.Marca;
import drones.model.drones.Modelo;
import drones.repository.CameraRepository;
import drones.repository.DroneRepository;
import drones.repository.MarcaRepository;
import drones.repository.ModeloRepository;
import io.quarkus.test.TestTransaction;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

@QuarkusTest
class DroneCatalogFiltersTest {
    @Inject
    DroneService droneService;

    @Inject
    DroneRepository droneRepository;

    @Inject
    MarcaRepository marcaRepository;

    @Inject
    ModeloRepository modeloRepository;

    @Inject
    CameraRepository cameraRepository;

    @Test
    @TestTransaction
    void deveCombinarFiltrosDeCatalogoComEEntreCategorias() {
        String sufixo = Long.toString(System.nanoTime());

        Marca marca = new Marca();
        marca.setNome("Marca filtro " + sufixo);
        marcaRepository.persist(marca);

        Modelo modelo = new Modelo();
        modelo.setNome("Modelo filtro " + sufixo);
        modelo.setMarca(marca);
        modeloRepository.persist(modelo);

        Camera camera = new Camera();
        camera.setMarca(marca);
        camera.setModelo(modelo);
        camera.setResolucao("Full HD 1080p");
        camera.setEstabilizacao(true);
        cameraRepository.persist(camera);

        Drone correspondente = criarDrone("catalogo filtro correspondente " + sufixo, marca, modelo, camera, true);
        Drone semGps = criarDrone("catalogo filtro sem gps " + sufixo, marca, modelo, camera, false);
        droneRepository.persist(correspondente);
        droneRepository.persist(semGps);

        DroneCatalogFilters filtros = new DroneCatalogFilters(
                "catalogo filtro",
                null,
                null,
                1_000.0,
                5_000.0,
                List.of("ATE_10KM"),
                List.of("DE_20_A_40_MIN"),
                List.of("FULL_HD", "ESTABILIZACAO"),
                true,
                true,
                true);

        List<Drone> resultados = droneService.buscarCatalogo(0, 12, filtros);

        assertEquals(1, resultados.size());
        assertEquals(correspondente.getNome(), resultados.get(0).getNome());
        assertEquals(1L, droneService.countCatalogo(filtros));
    }

    @Test
    @TestTransaction
    void deveRejeitarOpcaoDeFiltroDesconhecida() {
        DroneCatalogFilters filtros = new DroneCatalogFilters(
                null,
                null,
                null,
                null,
                null,
                List.of("ALCANCE_INVALIDO"),
                null,
                null,
                null,
                null,
                null);

        assertThrows(ValidationException.class, () -> droneService.buscarCatalogo(0, 12, filtros));
    }

    private Drone criarDrone(String nome, Marca marca, Modelo modelo, Camera camera, boolean possuiGPS) {
        Drone drone = new Drone();
        drone.setNome(nome);
        drone.setMarca(marca);
        drone.setModelo(modelo);
        drone.setCamera(camera);
        drone.setPossuiCamera(true);
        drone.setPreco(3_000.0);
        drone.setAtiva(true);
        drone.setAlcanceTransmissao(9_000);
        drone.setTempoVooPratico(30);
        drone.setPossuiGPS(possuiGPS);
        drone.setComControleRemoto(true);
        drone.setControladoPorAplicativo(true);
        return drone;
    }
}
