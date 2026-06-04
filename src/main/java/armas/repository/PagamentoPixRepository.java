package armas.repository;

import armas.model.pedido.PagamentoPix;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class PagamentoPixRepository implements PanacheRepository<PagamentoPix> {

    @Transactional
    public void salvar(PagamentoPix pagamentoPix) {
        persist(pagamentoPix);
    }

    public List<PagamentoPix> findByPedidoId(Long pedidoId) {
        return find("pedido.id", pedidoId).list();
    }

    public PagamentoPix findByPedidoIdPix(Long pedidoId) {
        return find("pedido.id", pedidoId).firstResult();
    }
}
