package armas.services;

import java.util.List;

import armas.model.fornecedor.Fornecedor;

public interface FornecedorServiceInterface {

    List<Fornecedor> findAll();
    Fornecedor findById(Long id);
    Fornecedor create(Fornecedor fornecedor);
    Fornecedor update(Long id, Fornecedor fornecedor);
    boolean delete(Long id);
}
