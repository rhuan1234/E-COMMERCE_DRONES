package armas.services;

import java.util.List;

import armas.model.administrador.Administrador;

public interface AdministradorServiceInterface {

    List<Administrador> findAll();
    Administrador findById(Long id);
    Administrador create(Administrador administrador);
    Administrador update(Long id, Administrador administrador);
    boolean delete(Long id);
}