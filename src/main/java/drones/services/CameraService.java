package drones.services;

import java.util.List;

import drones.exception.ValidationException;
import drones.model.drones.Camera;
import drones.repository.CameraRepository;
import drones.repository.DroneRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class CameraService implements CameraServiceInterface {

    @Inject
    CameraRepository cameraRepository;

    @Inject
    DroneRepository droneRepository;

    @Override
    @Transactional
    public Camera criar(Camera camera) {
        if (camera == null) {
            throw new ValidationException("Dados da câmera são obrigatórios");
        }
        cameraRepository.persist(camera);
        return camera;
    }

    @Override
    public List<Camera> buscarTodos() {
        return cameraRepository.findAll().list();
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