package armas.repository;

import armas.model.mira.Mira;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class MiraRepository implements PanacheRepository<Mira> {
    
    @Transactional
    public void salvar(Mira mira) {
        persist(mira);
    }

    public Mira findByModelo(String modelo) {
        return find("modelo", modelo).firstResult();
    }
}