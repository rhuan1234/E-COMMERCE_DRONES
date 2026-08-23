package drones.repository;

import drones.model.fornecedor.Telefone;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class TelefoneRepository implements PanacheRepository<Telefone> {

    @Transactional
    public void salvar(Telefone telefone) {
        persist(telefone);
    }
}
