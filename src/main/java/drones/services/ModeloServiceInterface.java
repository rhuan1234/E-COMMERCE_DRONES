package drones.services;

import java.util.List;

import drones.model.drones.Modelo;

public interface ModeloServiceInterface {

    List<Modelo> buscarTodos();
    List<Modelo> buscarTodos(int page, int pageSize);
    List<Modelo> buscarPorNome(int page, int pageSize, String nome);
    List<Modelo> buscarPorMarca(int page, int pageSize, Long marcaId);
    long count();
    long countNomes(String nome);
    long countPorMarca(Long marcaId);
    Modelo buscarPorId(Long id);
    Modelo criar(Modelo modelo);
    Modelo atualizar(Long id, Modelo modelo);
    boolean deletar(Long id);
}
