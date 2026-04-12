package armas.services;

import java.util.List;

import armas.model.fornecedor.Endereco;

public interface EnderecoServiceInterface {
    List<Endereco> findAll();
    Endereco findById(Long id);
    Endereco create(Endereco endereco);
    Endereco update(Long id, Endereco endereco);
    boolean delete(Long id);
}
