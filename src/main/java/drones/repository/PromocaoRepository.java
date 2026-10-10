package drones.repository;

import drones.model.promocao.Promocao;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class PromocaoRepository implements PanacheRepository<Promocao> {
    @Transactional
    public void salvar(Promocao promocao) {
        persist(promocao);
    }
}