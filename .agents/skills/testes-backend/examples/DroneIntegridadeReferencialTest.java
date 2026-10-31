package drones.services;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import drones.exception.ValidationException;
import drones.model.drones.Drone;
import drones.model.drones.Marca;
import drones.model.drones.Modelo;
import drones.model.fornecedor.Fornecedor;
import drones.repository.DroneRepository;
import drones.repository.FornecedorRepository;
import drones.repository.MarcaRepository;
import drones.repository.ModeloRepository;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Exemplo de Teste de Integridade Referencial e Validações Cruzadas.
 * Valida a regra de negócio mandatória: "Todo Modelo pertence a uma Marca, e o Drone não pode
 * associar uma Marca com um Modelo pertencente a outro fabricante".
 */
@QuarkusTest
@DisplayName("Teste de Integridade Referencial - DroneService")
public class DroneIntegridadeReferencialTest {

    @Inject
    DroneService droneService;

    @Inject
    DroneRepository droneRepository;

    @Inject
    MarcaRepository marcaRepository;

    @Inject
    ModeloRepository modeloRepository;

    @Inject
    FornecedorRepository fornecedorRepository;

    @Test
    @Transactional
    @DisplayName("Deve lançar ValidationException quando o modelo não pertencer à marca informada")
    void deveRejeitarModeloDeOutraMarca() {
        Marca marcaDJI = marcaRepository.findById(1L);
        Marca marcaAutel = marcaRepository.findById(2L);

        assertNotNull(marcaDJI, "Marca DJI deve existir");
        assertNotNull(marcaAutel, "Marca Autel deve existir");

        // Modelo 3 pertence à Marca 2 (Autel Robotics)
        Modelo modeloAutel = modeloRepository.findById(3L);
        assertNotNull(modeloAutel, "Modelo Autel deve existir");
        assertEquals(2L, modeloAutel.getMarca().getId());

        Fornecedor fornecedor = fornecedorRepository.findById(1L);
        assertNotNull(fornecedor, "Fornecedor deve existir");

        Drone droneInvalido = new Drone();
        droneInvalido.setNome("Drone Invalido Teste");
        droneInvalido.setMarca(marcaDJI); // Incongruência proposital: Marca DJI (1) com Modelo Autel (3)
        droneInvalido.setModelo(modeloAutel);
        droneInvalido.setFornecedor(fornecedor);
        droneInvalido.setPreco(5000.0);
        droneInvalido.setQuantidadeDisponivel(5);

        ValidationException ex = assertThrows(ValidationException.class, () -> {
            droneService.criar(droneInvalido);
        });

        assertEquals("O modelo selecionado não pertence à marca escolhida", ex.getMessage());
        assertEquals("modeloId", ex.getField());
    }

    @Test
    @Transactional
    @DisplayName("Deve permitir cadastro quando marca e modelo forem coerentes")
    void devePermitirMarcaEModeloConsistentes() {
        Marca marcaDJI = marcaRepository.findById(1L);
        Modelo modeloDJI = modeloRepository.findById(1L);
        Fornecedor fornecedor = fornecedorRepository.findById(1L);

        assertNotNull(marcaDJI);
        assertNotNull(modeloDJI);
        assertEquals(1L, modeloDJI.getMarca().getId());

        Drone droneValido = new Drone();
        droneValido.setNome("Drone Consistente Teste " + System.currentTimeMillis());
        droneValido.setMarca(marcaDJI);
        droneValido.setModelo(modeloDJI);
        droneValido.setFornecedor(fornecedor);
        droneValido.setPreco(4500.0);
        droneValido.setQuantidadeDisponivel(10);
        droneValido.setAtiva(true);

        Drone droneSalvo = droneService.criar(droneValido);

        assertNotNull(droneSalvo.getId());
        assertEquals(marcaDJI.getId(), droneSalvo.getMarca().getId());
        assertEquals(modeloDJI.getId(), droneSalvo.getModelo().getId());
    }
}
