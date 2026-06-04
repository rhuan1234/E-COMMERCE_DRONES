package armas.services;

import java.util.List;
import armas.model.mira.RedDot;

public interface RedDotServiceInterface {
    RedDot criar(RedDot mira);
    boolean deletar(Long id);
    List<RedDot> buscarTodos();
    RedDot buscarPorId(Long id);
    RedDot atualizar(Long id, RedDot dados);
    RedDot buscarPorModelo(String modelo);
}
