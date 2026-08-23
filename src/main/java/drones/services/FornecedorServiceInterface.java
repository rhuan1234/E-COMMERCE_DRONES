package drones.services;

import java.util.List;

import drones.model.fornecedor.Fornecedor;

public interface FornecedorServiceInterface {

    List<Fornecedor> buscarTodos();
    Fornecedor buscarPorId(Long id);
    Fornecedor criar(Fornecedor fornecedor);
    Fornecedor atualizar(Long id, Fornecedor fornecedor);
    boolean deletar(Long id);
    Fornecedor buscarPorNome(String nome);
}
