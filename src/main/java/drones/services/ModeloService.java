package drones.services;

import java.util.List;

import drones.exception.ValidationException;
import drones.model.drones.Marca;
import drones.model.drones.Modelo;
import drones.repository.CameraRepository;
import drones.repository.DroneRepository;
import drones.repository.MarcaRepository;
import drones.repository.ModeloRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class ModeloService implements ModeloServiceInterface {

    @Inject
    ModeloRepository modeloRepository;

    @Inject
    MarcaRepository marcaRepository;

    @Inject
    DroneRepository droneRepository;

    @Inject
    CameraRepository cameraRepository;

    @Override
    @Transactional
    public Modelo criar(Modelo modelo) {
        if (modelo == null) {
            throw new ValidationException("Dados do modelo são obrigatórios");
        }
        if (modelo.getMarca() == null || modelo.getMarca().getId() == null) {
            throw new ValidationException("A marca do modelo é obrigatória", "marcaId");
        }
        Marca marca = marcaRepository.findById(modelo.getMarca().getId());
        if (marca == null) {
            throw new ValidationException("Marca informada não encontrada", "marcaId");
        }
        modelo.setMarca(marca);
        modeloRepository.persist(modelo);
        return modelo;
    }

    @Override
    public List<Modelo> buscarTodos() {
        return modeloRepository.findAll().list();
    }

    @Override
    public List<Modelo> buscarTodos(int page, int pageSize) {
        return modeloRepository.findAll().page(page, pageSize).list();
    }

    @Override
    public List<Modelo> buscarPorNome(int page, int pageSize, String nome) {
        if (nome == null || nome.isBlank()) {
            throw new ValidationException("Nome do modelo é obrigatório", "nome");
        }
        List<Modelo> modelos = modeloRepository.findByNome(nome).page(page, pageSize).list();
        if (modelos.isEmpty()) {
            throw new ValidationException("Nenhum modelo encontrado para o nome '" + nome + "'", "nome");
        }
        return modelos;
    }

    @Override
    public List<Modelo> buscarPorMarca(int page, int pageSize, Long marcaId) {
        validarId(marcaId);
        return modeloRepository.findByMarcaId(marcaId).page(page, pageSize).list();
    }

    @Override
    public long count() {
        return modeloRepository.count();
    }

    @Override
    public long countNomes(String nome) {
        return modeloRepository.findByNome(nome).count();
    }

    @Override
    public long countPorMarca(Long marcaId) {
        return modeloRepository.findByMarcaId(marcaId).count();
    }

    @Override
    public Modelo buscarPorId(Long id) {
        validarId(id);
        return modeloRepository.findById(id);
    }

    @Override
    @Transactional
    public Modelo atualizar(Long id, Modelo dados) {
        validarId(id);
        if (dados == null) {
            throw new ValidationException("Dados do modelo são obrigatórios");
        }

        Modelo modelo = modeloRepository.findById(id);
        if (modelo == null) {
            return null;
        }

        if (dados.getMarca() == null || dados.getMarca().getId() == null) {
            throw new ValidationException("A marca do modelo é obrigatória", "marcaId");
        }
        Marca marca = marcaRepository.findById(dados.getMarca().getId());
        if (marca == null) {
            throw new ValidationException("Marca informada não encontrada", "marcaId");
        }

        modelo.setNome(dados.getNome());
        modelo.setMarca(marca);
        return modelo;
    }

    @Override
    @Transactional
    public boolean deletar(Long id) {
        validarId(id);
        if (droneRepository.find("modelo.id", id).count() > 0 ||
            cameraRepository.find("modelo.id", id).count() > 0) {
            return false;
        }
        return modeloRepository.deleteById(id);
    }

    private void validarId(Long id) {
        if (id == null || id <= 0) {
            throw new ValidationException("Id inválido", "id");
        }
    }
}
