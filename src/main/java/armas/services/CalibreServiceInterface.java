package armas.services;

import java.util.List;

import armas.model.armas.Calibre;

public interface CalibreServiceInterface {

    List<Calibre> findAll();
    Calibre findById(Long id);
    Calibre create(Calibre calibre);
    Calibre update(Long id, Calibre calibre);
    boolean delete(Long id);
}