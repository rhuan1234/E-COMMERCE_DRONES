package drones.repository;

import drones.model.fornecedor.Estado;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class EstadoRepository implements PanacheRepository<Estado> {

    @Transactional
    public void salvar(Estado estado) {
        persist(estado);
    }

    public Estado findByNome(String nome) {
        return find("lower(nome) = ?1", nome.toLowerCase()).firstResult();
    }
}
