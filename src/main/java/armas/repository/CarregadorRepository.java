package armas.repository;

import armas.model.armas.Carregador;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class CarregadorRepository implements PanacheRepository<Carregador> {
    
    @Transactional
    public void salvar(Carregador carregador) {
        persist(carregador);
    }

    public Carregador findByModelo(String modelo) {
        return find("modelo", modelo).firstResult();
    }
}
