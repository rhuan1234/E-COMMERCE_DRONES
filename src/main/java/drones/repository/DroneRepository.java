package drones.repository;

import java.util.HashMap;
import java.util.Map;

import drones.model.drones.Drone;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class DroneRepository implements PanacheRepository<Drone> {

    @Transactional
    public void salvar(Drone drone){
        persist(drone);
    }

    public final PanacheQuery<Drone> findByFiltros(
            String nome,
            String marca,
            String modelo,
            Double precoMin,
            Double precoMax) {
        StringBuilder query = new StringBuilder("1 = 1");
        Map<String, Object> params = new HashMap<>();

        if (nome != null && !nome.isBlank()) {
            query.append(" AND nome ILIKE :nome");
            params.put("nome", "%" + nome.trim() + "%");
        }
        if (marca != null && !marca.isBlank()) {
            query.append(" AND marca.nome ILIKE :marca");
            params.put("marca", "%" + marca.trim() + "%");
        }
        if (modelo != null && !modelo.isBlank()) {
            query.append(" AND modelo.nome ILIKE :modelo");
            params.put("modelo", "%" + modelo.trim() + "%");
        }
        if (precoMin != null) {
            query.append(" AND preco >= :precoMin");
            params.put("precoMin", precoMin);
        }
        if (precoMax != null) {
            query.append(" AND preco <= :precoMax");
            params.put("precoMax", precoMax);
        }

        return find(query.toString(), params);
    }

    public final PanacheQuery<Drone> findByMarca(String marca) {
        return find("marca.nome ILIKE ?1", "%" + marca + "%");
    }

    public final Drone findByNome(String nome) {
        return find("nome ILIKE ?1", "%" + nome + "%").firstResult();
    }

    public final PanacheQuery<Drone> findByModelo(String modelo) {
        return find("modelo.nome ILIKE ?1", "%" + modelo + "%");
    }

    public final PanacheQuery<Drone> findByPrecoRange(double precoMin, double precoMax) {
        return find("preco >= ?1 AND preco <= ?2", precoMin, precoMax);
    }
}