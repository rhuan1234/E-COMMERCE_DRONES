package drones.services;

import java.util.List;

import drones.model.promocao.Promocao;

public interface PromocaoServiceInterface {
    List<Promocao> buscarTodos();
    List<Promocao> buscarTodos(int page, int pageSize);
    long count();
    Promocao buscarPorId(Long id);
    Promocao criar(Promocao promocao, List<Long> droneIds);
    Promocao atualizar(Long id, Promocao promocao, List<Long> droneIds);
    boolean deletar(Long id);
}