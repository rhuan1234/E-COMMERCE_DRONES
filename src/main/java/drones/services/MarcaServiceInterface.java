package drones.services;

import java.util.List;

import drones.model.drones.Marca;

public interface MarcaServiceInterface {

    List<Marca> buscarTodos();
    List<Marca> buscarTodos(int page, int pageSize);
    List<Marca> buscarPorNome(int page, int pageSize, String nome);
    long count();
    long countNomes(String nome);
    Marca buscarPorId(Long id);
    Marca criar(Marca marca);
    Marca atualizar(Long id, Marca marca);
    boolean deletar(Long id);
}
