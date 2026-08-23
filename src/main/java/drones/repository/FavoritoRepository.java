package drones.repository;
import jakarta.transaction.Transactional;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

import drones.model.drones.Favorito;

@ApplicationScoped
public class FavoritoRepository implements PanacheRepository<Favorito>{
    
    @Transactional
    public void salvar(Favorito favorito){
        persist(favorito);
    }

    public Favorito encontrarFavorito(Long usuarioId, Long droneId) {
        return find("usuario.id = ?1 and drone.id = ?2", usuarioId, droneId)
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
