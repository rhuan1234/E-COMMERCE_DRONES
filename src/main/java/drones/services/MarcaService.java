package drones.services;

import java.util.List;

import drones.exception.ValidationException;
import drones.model.drones.Marca;
import drones.repository.CameraRepository;
import drones.repository.DroneRepository;
import drones.repository.MarcaRepository;
import drones.repository.ModeloRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class MarcaService implements MarcaServiceInterface {

    @Inject
    MarcaRepository marcaRepository;

    @Inject
    ModeloRepository modeloRepository;

    @Inject
    DroneRepository droneRepository;

    @Inject
    CameraRepository cameraRepository;

    @Override
    @Transactional
    public Marca criar(Marca marca) {
        if (marca == null) {
            throw new ValidationException("Dados da marca são obrigatórios");
        }
        marcaRepository.persist(marca);
        return marca;
    }

    @Override
    public List<Marca> buscarTodos() {
        return marcaRepository.findAll().list();
    }

    @Override
    public List<Marca> buscarTodos(int page, int pageSize) {
        return marcaRepository.findAll().page(page, pageSize).list();
    }

    @Override
    public List<Marca> buscarPorNome(int page, int pageSize, String nome) {
        if (nome == null || nome.isBlank()) {
            throw new ValidationException("Nome da marca é obrigatório", "nome");
        }
        List<Marca> marcas = marcaRepository.findByNome(nome).page(page, pageSize).list();
        if (marcas.isEmpty()) {
            throw new ValidationException("Nenhuma marca encontrada para o nome '" + nome + "'", "nome");
        }
        return marcas;
    }

    @Override
    public long count() {
        return marcaRepository.count();
    }

    @Override
    public long countNomes(String nome) {
        return marcaRepository.findByNome(nome).count();
    }

    @Override
    public Marca buscarPorId(Long id) {
        validarId(id);
        return marcaRepository.findById(id);
    }

    @Override
    @Transactional
    public Marca atualizar(Long id, Marca dados) {
        validarId(id);
        if (dados == null) {
            throw new ValidationException("Dados da marca são obrigatórios");
        }

        Marca marca = marcaRepository.findById(id);
        if (marca == null) {
            return null;
        }

        marca.setNome(dados.getNome());
        return marca;
    }

    @Override
    @Transactional
    public boolean deletar(Long id) {
        validarId(id);
        if (modeloRepository.find("marca.id", id).count() > 0 ||
            droneRepository.find("marca.id", id).count() > 0 ||
            cameraRepository.find("marca.id", id).count() > 0) {
            return false;
        }
        return marcaRepository.deleteById(id);
    }

    private void validarId(Long id) {
        if (id == null || id <= 0) {
            throw new ValidationException("Id da marca inválido", "id");
        }
    }
}
