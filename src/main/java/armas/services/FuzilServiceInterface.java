package armas.services;

import java.util.List;

import armas.model.armas.Fuzil;

public interface FuzilServiceInterface {

    List<Fuzil> buscarTodos();
    Fuzil buscarPorId(Long id);
    Fuzil criar(Fuzil fuzil);
    Fuzil atualizar(Long id, Fuzil fuzil);
    boolean deletar(Long id);
    Fuzil buscarPorNome(String nome);
}