package armas.repository;
import jakarta.transaction.Transactional;
import armas.model.armas.Favorito;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class FavoritoRepository implements PanacheRepository<Favorito>{
    
    @Transactional
    public void salvar(Favorito favorito){
        persist(favorito);
    }

    public Favorito encontrarFavorito(Long usuarioId, Long fuzilId) {
        return find("usuario.id = ?1 and fuzil.id = ?2", usuarioId, fuzilId)
                .firstResult();
    }

    @Transactional
    public void remover(Favorito favorito) {
        delete(favorito);
    }

    public List<Favorito> listarPorUsuario(Long usuarioId) {
        return list("usuario.id = ?1", usuarioId);
    }
}
