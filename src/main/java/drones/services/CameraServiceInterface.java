package drones.services;

import java.util.List;

import drones.model.drones.Camera;

public interface CameraServiceInterface {

    List<Camera> buscarTodos();
    Camera buscarPorId(Long id);
    Camera criar(Camera camera);
    Camera atualizar(Long id, Camera camera);
    boolean deletar(Long id);
}