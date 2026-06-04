package armas.services;

import java.util.List;
import armas.model.mira.MiraHolografica;

public interface MiraHolograficaServiceInterface {
    MiraHolografica criar(MiraHolografica mira);
    boolean deletar(Long id);
    List<MiraHolografica> buscarTodos();
    MiraHolografica buscarPorId(Long id);
    MiraHolografica atualizar(Long id, MiraHolografica dados);
    MiraHolografica buscarPorModelo(String modelo);
}
