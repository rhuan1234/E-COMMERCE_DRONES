package drones.services;
import java.util.List;

import drones.model.drones.Favorito;

public interface FavoritoServiceInterface {
    public void salvar(String login, Long droneId);
    public void remover(String login, Long droneId);
    public List<Favorito> listarFavoritos(String login);
}
