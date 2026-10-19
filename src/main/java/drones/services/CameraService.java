package drones.services;

import java.util.List;

import drones.exception.ValidationException;
import drones.model.drones.Camera;
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
public class CameraService implements CameraServiceInterface {

    @Inject
    CameraRepository cameraRepository;

    @Inject
    DroneRepository droneRepository;

    @Inject
    MarcaRepository marcaRepository;

    @Inject
    ModeloRepository modeloRepository;

    private void validarMarcaEModelo(Camera camera) {
        if (camera.getMarca() == null || camera.getMarca().getId() == null) {
            throw new ValidationException("A marca da câmera é obrigatória", "marcaId");
        }
        Marca marca = marcaRepository.findById(camera.getMarca().getId());
        if (marca == null) {
            throw new ValidationException("Marca da câmera não encontrada", "marcaId");
        }

        if (camera.getModelo() == null || camera.getModelo().getId() == null) {
            throw new ValidationException("O modelo da câmera é obrigatório", "modeloId");
        }
        Modelo modelo = modeloRepository.findById(camera.getModelo().getId());
        if (modelo == null) {
            throw new ValidationException("Modelo da câmera não encontrado", "modeloId");
        }

        if (modelo.getMarca() == null || !modelo.getMarca().getId().equals(marca.getId())) {
            throw new ValidationException("O modelo selecionado não pertence à marca escolhida", "modeloId");
        }

        camera.setMarca(marca);
        camera.setModelo(modelo);
    }

    @Override
    @Transactional
    public Camera criar(Camera camera) {
        if (camera == null) {
            throw new ValidationException("Dados da câmera são obrigatórios");
        }
        validarMarcaEModelo(camera);
        cameraRepository.persist(camera);
        return camera;
    }

    @Override
    public List<Camera> buscarTodos() {
        return cameraRepository.findAll().list();
    }

    @Override
    public List<Camera> buscarTodos(int page, int pageSize) {
        return cameraRepository.findAll().page(page, pageSize).list();
    }

    @Override
    public List<Camera> buscarPorModelo(int page, int pageSize, String modelo) {
        if (modelo == null || modelo.isBlank()) {
            throw new ValidationException("Modelo da câmera é obrigatório", "modelo");
        }
        List<Camera> cameras = cameraRepository.findByModelo(modelo).page(page, pageSize).list();
        if (cameras.isEmpty()) {
            throw new ValidationException("Nenhuma câmera encontrada para o modelo '" + modelo + "'", "modelo");
        }
        return cameras;
    }

    @Override
    public long count() {
        return cameraRepository.count();
    }

    @Override
    public long countModelos(String modelo) {
        return cameraRepository.findByModelo(modelo).count();
    }

    @Override
    public Camera buscarPorId(Long id) {
        validarId(id);
        return cameraRepository.findById(id);
    }

    @Override
    @Transactional
    public Camera atualizar(Long id, Camera dados) {
        validarId(id);
        if (dados == null) {
            throw new ValidationException("Dados da câmera são obrigatórios");
        }

        Camera camera = cameraRepository.findById(id);
        if (camera == null) {
            return null;
        }

        validarMarcaEModelo(dados);

        camera.setModelo(dados.getModelo());
        camera.setMarca(dados.getMarca());
        camera.setResolucao(dados.getResolucao());
        camera.setZoom(dados.getZoom());
        camera.setEstabilizacao(dados.isEstabilizacao());
        camera.setFps(dados.getFps());
        return camera;
    }

    @Override
    @Transactional
    public boolean deletar(Long id) {
        validarId(id);
        if (droneRepository.find("camera.id", id).count() > 0) {
            return false;
        }
        return cameraRepository.deleteById(id);
    }

    private void validarId(Long id) {
        if (id == null || id <= 0) {
            throw new ValidationException("Id da câmera inválido", "id");
        }
    }
}