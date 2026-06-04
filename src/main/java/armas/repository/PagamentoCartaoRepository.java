package armas.repository;

import armas.model.pedido.PagamentoCartao;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class PagamentoCartaoRepository implements PanacheRepository<PagamentoCartao> {

    @Transactional
    public void salvar(PagamentoCartao pagamentoCartao) {
        persist(pagamentoCartao);
    }

    public List<PagamentoCartao> findByPedidoId(Long pedidoId) {
        return find("pedido.id", pedidoId).list();
    }

    public PagamentoCartao findByPedidoIdCartao(Long pedidoId) {
        return find("pedido.id", pedidoId).firstResult();
    }
}
