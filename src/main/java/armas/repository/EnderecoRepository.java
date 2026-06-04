package armas.repository;

import armas.model.fornecedor.Endereco;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class EnderecoRepository implements PanacheRepository<Endereco> {

    @Transactional
    public void salvar(Endereco endereco) {
        persist(endereco);
    }

    public Endereco findByCep(String cep) {
        return find("cep", cep).firstResult();
    }
}
