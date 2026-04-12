package armas.services;

import java.util.List;

import armas.model.fornecedor.Telefone;

public interface TelefoneServiceInterface {
    List<Telefone> findAll();
    Telefone findById(Long id);
    Telefone create(Telefone telefone);
    Telefone update(Long id, Telefone telefone);
    boolean delete(Long id);
}
