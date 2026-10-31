package drones.services;

import drones.model.drones.Drone;
import drones.model.drones.DroneImage;
import java.util.List;

public interface DroneServiceInterface {

    List<Drone> buscarTodos(int page, int pageSize);
    Drone buscarPorId(Long id);
    Drone criar(Drone drone);
    Drone adicionarImagem(Long droneId, DroneImage imagem);
    void deletarImagem(Long droneId, Long imagemId);
    DroneImage buscarImagem(Long imagemId);
    Drone atualizar(Long id, Drone drone);
    boolean deletar(Long id);
    Drone buscarPorNome(String nome);
    List<Drone> buscarPorMarca(int page, int pageSize, String marca);
    List<Drone> buscarPorModelo(int page, int pageSize, String modelo);
    List<Drone> buscarPorPreco(int page, int pageSize, double precoMin, double precoMax);
    List<Drone> buscarComFiltros(int page, int pageSize, String nome, String marca, String modelo, Double precoMin, Double precoMax);
    Long count();
    Long countModelos(String modelo);
    Long countMarcas(String marca);
    Long countPreco(double precoMin, double precoMax);
    Long countComFiltros(String nome, String marca, String modelo, Double precoMin, Double precoMax);
}