package armas.repository;

import armas.model.armas.Fuzil;
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

    public Fuzil findArmaById(Long id) {
        return getEntityManager().find(Fuzil.class, id);
    }

    public Fornecedor findByNome(String nome) {
        return find("lower(nome) = ?1", nome.toLowerCase()).firstResult();
    }
}
