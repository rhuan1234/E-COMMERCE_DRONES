package drones.repository;

import java.util.List;

import drones.model.drones.Drone;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class DroneRepository implements PanacheRepository<Drone> {

    @Transactional
    public void salvar(Drone drone){
        persist(drone);
    }

    public final List<Drone> findByMarca(String marca) {
        return find("marca ILIKE ?1", "%" + marca + "%").list();
    }

    public final Drone findByNome(String nome) {
        return find("nome ILIKE ?1", "%" + nome + "%").firstResult();
    }

    public final List<Drone> findByModelo(String modelo) {
        return find("modelo ILIKE ?1", "%" + modelo + "%").list();
    }

    public final List<Drone> findByPrecoRange(double precoMin, double precoMax) {
        return find("preco >= ?1 AND preco <= ?2", precoMin, precoMax).list();
    }
}