package armas.repository;

import armas.model.armas.RiflePrecisao;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class RiflePrecisaoRepository implements PanacheRepository<RiflePrecisao> {

    @Transactional
    public void salvar(RiflePrecisao riflePrecisao){
        persist(riflePrecisao);
    }
}
