package armas.services;

import java.util.List;

import armas.model.armas.Pistola;

public interface PistolaServiceInterface {
    List<Pistola> findAll();
    Pistola findById(Long id);
    Pistola create(Pistola pistola);
    Pistola update(Long id, Pistola pistola);
    boolean delete(Long id);
}
