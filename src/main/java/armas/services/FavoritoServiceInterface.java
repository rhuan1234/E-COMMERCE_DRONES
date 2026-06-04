package armas.services;
import java.util.List;
import armas.model.armas.Favorito;

public interface FavoritoServiceInterface {
    public void salvar(String login, Long fuzilId);
    public void remover(String login, Long fuzilId);
    public List<Favorito> listarFavoritos(String login);
}
