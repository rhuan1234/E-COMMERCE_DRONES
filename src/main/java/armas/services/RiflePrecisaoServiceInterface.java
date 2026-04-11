package armas.services;

import java.util.List;

import armas.model.armas.RiflePrecisao;

public interface RiflePrecisaoServiceInterface {

    List<RiflePrecisao> findAll();
    RiflePrecisao findById(Long id);
    RiflePrecisao create(RiflePrecisao riflePrecisao);
    RiflePrecisao update(Long id, RiflePrecisao riflePrecisao);
    boolean delete(Long id);
}
