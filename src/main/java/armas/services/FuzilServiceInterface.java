package armas.services;

import java.util.List;

import armas.model.armas.Fuzil;

public interface FuzilServiceInterface {

    List<Fuzil> findAll();
    Fuzil findById(Long id);
    Fuzil create(Fuzil fuzil);
    Fuzil update(Long id, Fuzil fuzil);
    boolean delete(Long id);
}