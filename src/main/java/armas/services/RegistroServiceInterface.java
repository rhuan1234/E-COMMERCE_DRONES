package armas.services;

import java.util.List;

import armas.model.registro.Registro;

public interface RegistroServiceInterface {

    List<Registro> findAll();
    Registro findById(Long id);
    Registro create(Registro registro);
    Registro update(Long id, Registro registro);
    boolean delete(Long id);
}