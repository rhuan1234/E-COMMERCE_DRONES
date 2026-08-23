package drones.services;

import java.util.List;

import drones.model.drones.Drone;

public interface DroneServiceInterface {

    List<Drone> buscarTodos();
    Drone buscarPorId(Long id);
    Drone criar(Drone drone);
    Drone atualizar(Long id, Drone drone);
    boolean deletar(Long id);
    Drone buscarPorNome(String nome);
}