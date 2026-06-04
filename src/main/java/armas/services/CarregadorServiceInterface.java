package armas.services;

import java.util.List;
import armas.model.armas.Carregador;

public interface CarregadorServiceInterface {
    Carregador criar(Carregador carregador);
    boolean deletar(Long id);
    List<Carregador> buscarTodos();
    Carregador buscarPorId(Long id);
    Carregador atualizar(Long id, Carregador dados);
    Carregador buscarPorModelo(String modelo);
}
