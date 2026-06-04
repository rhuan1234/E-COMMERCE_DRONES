package armas.repository;

import armas.model.mira.MiraHolografica;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class MiraHolograficaRepository implements PanacheRepository<MiraHolografica> {
    
    @Transactional
    public void salvar(MiraHolografica mira) {
        persist(mira);
    }

    public MiraHolografica findByModelo(String modelo) {
        return find("modelo", modelo).firstResult();
    }
}
