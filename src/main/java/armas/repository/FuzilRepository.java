package armas.repository;

import armas.model.armas.Fuzil;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class FuzilRepository implements PanacheRepository<Fuzil> {

    @Transactional
    public void salvar(Fuzil fuzil){
        persist(fuzil);
    }
}