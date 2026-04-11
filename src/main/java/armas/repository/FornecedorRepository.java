package armas.repository;

import armas.model.armas.Arma;
import armas.model.fornecedor.Fornecedor;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class FornecedorRepository implements PanacheRepository<Fornecedor> {

    @Transactional
    public void salvar(Fornecedor fornecedor){
        persist(fornecedor);
    }

    public Arma findArmaById(Long id) {
        return getEntityManager().find(Arma.class, id);
    }
}
