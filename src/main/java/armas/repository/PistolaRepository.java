package armas.repository;

import armas.model.armas.Pistola;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.transaction.Transactional;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class PistolaRepository implements PanacheRepository<Pistola>{
    @Transactional
    public void salvar(Pistola pistola){
        persist(pistola);
    }

    
}
