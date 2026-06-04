package armas.services;

import java.util.List;

import armas.model.armas.Calibre;

public interface CalibreServiceInterface {

    List<Calibre> buscarTodos();
    Calibre buscarPorId(Long id);
    Calibre criar(Calibre calibre);
    Calibre atualizar(Long id, Calibre calibre);
    boolean deletar(Long id);
    Calibre buscarPorNome(String nome);
}