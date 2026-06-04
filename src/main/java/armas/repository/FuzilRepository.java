package armas.repository;

import java.util.List;

import armas.model.armas.Fuzil;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class FuzilRepository implements PanacheRepository<Fuzil> {

    @Transactional
    public void salvar(Fuzil fuzil){
        persist(fuzil);
    }

    public final List<Fuzil> findByMarca(String marca) {
        return find("marca ILIKE ?1", "%" + marca + "%").list();
    }

    public final Fuzil findByNome(String nome) {
        return find("nome ILIKE ?1", "%" + nome + "%").firstResult();
    }

    public final List<Fuzil> findByModelo(String modelo) {
        return find("modelo ILIKE ?1", "%" + modelo + "%").list();
    }

    public final List<Fuzil> findByPrecoRange(double precoMin, double precoMax) {
        return find("preco >= ?1 AND preco <= ?2", precoMin, precoMax).list();
    }
}