package drones.services;

import java.util.List;

import drones.dto.drones.AvaliacaoRequestDTO;
import drones.model.drones.Avaliacao;

public interface AvaliacaoServiceInterface {
    List<Avaliacao> buscarTodos();
    List<Avaliacao> buscarPorDrone(Long droneId);
    Avaliacao buscarPorId(Long id);
    Avaliacao criar(AvaliacaoRequestDTO dados, String login);
    Avaliacao atualizar(Long id, AvaliacaoRequestDTO dados, String login);
    boolean deletar(Long id, String login);
}