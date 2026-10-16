package drones.repository;

import drones.model.promocao.Promocao;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class PromocaoRepository implements PanacheRepository<Promocao> {
    @Transactional
    public void salvar(Promocao promocao) {
        persist(promocao);
    }

    public PanacheQuery<Promocao> findByNomeContaining(String nome) {
        return find("nome ILIKE ?1", "%" + nome + "%");
    }
}