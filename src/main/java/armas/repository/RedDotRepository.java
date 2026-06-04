package armas.repository;

import armas.model.mira.RedDot;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class RedDotRepository implements PanacheRepository<RedDot> {
    
    @Transactional
    public void salvar(RedDot mira) {
        persist(mira);
    }

    public RedDot findByModelo(String modelo) {
        return find("modelo", modelo).firstResult();
    }
}
