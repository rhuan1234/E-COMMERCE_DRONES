package armas.repository;

import java.util.List;

import armas.model.pedido.Pedido;
import armas.model.pedido.StatusPedido;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class PedidoRepository implements PanacheRepository<Pedido> {
    @Transactional
    public void salvar(Pedido pedido) {
        persist(pedido);
    }

    public List<Pedido> findAllByUserId(Long usuarioId) {
        return find("usuario.id", usuarioId).list();
    }

    public List<Pedido> findByStatus(String status) {
        return find("statusPedido", status).list();
    }

    public List<Pedido> listarPedidosPendentes() {
        return find("statusPedido", StatusPedido.PENDENTE).list();
    }

}
