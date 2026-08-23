package drones.repository;

import drones.model.drones.Drone;
import drones.model.fornecedor.Fornecedor;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class FornecedorRepository implements PanacheRepository<Fornecedor> {

    @Transactional
    public void salvar(Fornecedor fornecedor){
        persist(fornecedor);
    }

    public Drone findArmaById(Long id) {
        return getEntityManager().find(Drone.class, id);
    }

    public Fornecedor findByNome(String nome) {
        return find("lower(nome) = ?1", nome.toLowerCase()).firstResult();
    }
}
