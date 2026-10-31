package drones.repository;

import drones.model.fornecedor.Cidade;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class CidadeRepository implements PanacheRepository<Cidade> {

    @Transactional
    public void salvar(Cidade cidade) {
        persist(cidade);
    }

    public Cidade findByNome(String nome) {
        return find("lower(nome) = ?1", nome.toLowerCase()).firstResult();
    }

    public Cidade findByNomeAndEstado(String nome, Long estadoId) {
        return find("lower(nome) = ?1 and estado.id = ?2", nome.toLowerCase(), estadoId).firstResult();
    }
}
