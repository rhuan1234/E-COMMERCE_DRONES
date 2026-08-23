package drones.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response.Status;

import java.util.List;

import drones.model.drones.Drone;
import drones.model.drones.Favorito;
import drones.model.usuario.Usuario;
import drones.repository.FavoritoRepository;

@ApplicationScoped
public class FavoritoService implements FavoritoServiceInterface {
    @Inject
    FavoritoRepository favoritoRepository;
    @Inject
    DroneService droneService;
    @Inject
    AdminServiceInterface usuarioService;

    @Override
    public void salvar(String login, Long droneId) {
        Usuario usuario = buscarUsuario(login);
        Drone drone = droneService.buscarPorId(droneId);
        if (drone == null) {
            throw new WebApplicationException("Drone não encontrado", Status.NOT_FOUND);
        }

        // Verificar se o favorito já existe
        Favorito existente = favoritoRepository.encontrarFavorito(usuario.getId(), droneId);
        if (existente != null) {
            throw new WebApplicationException("Este drone já está nos favoritos", Status.BAD_REQUEST);
        }

        favoritoRepository.salvar(new Favorito(usuario, drone));
    }

    @Override
    public void remover(String login, Long droneId) {
        Usuario usuario = buscarUsuario(login);
        Drone drone = droneService.buscarPorId(droneId);
        if (drone == null) {
            throw new WebApplicationException("Drone não encontrado", Status.NOT_FOUND);
        }

        Favorito favorito = favoritoRepository.encontrarFavorito(usuario.getId(), droneId);
        if (favorito == null) {
            throw new WebApplicationException("Este drone não está nos favoritos", Status.NOT_FOUND);
        }

        favoritoRepository.remover(favorito);
    }

    @Override
    public List<Favorito> listarFavoritos(String login) {
        Usuario usuario = buscarUsuario(login);
        return favoritoRepository.listarPorUsuario(usuario.getId());
    }

    private Usuario buscarUsuario(String login) {
        Usuario usuario = usuarioService.buscarPorLogin(login);
        if (usuario == null) {
            throw new WebApplicationException("Usuário não encontrado", Status.NOT_FOUND);
        }
        return usuario;
    }
}
