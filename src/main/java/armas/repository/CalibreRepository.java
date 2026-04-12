package armas.repository;

import armas.model.armas.Calibre;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class CalibreRepository implements PanacheRepository<Calibre> {

    @Transactional
    public void salvar(Calibre calibre){
        persist(calibre);
    }
}