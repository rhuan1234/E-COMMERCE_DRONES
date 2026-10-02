package drones.repository;

import java.util.List;

import drones.model.pedido.Pedido;
import drones.model.pedido.StatusPedido;
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

    public io.quarkus.hibernate.orm.panache.PanacheQuery<Pedido> findByUsuarioId(Long usuarioId) {
        return find("usuario.id", usuarioId);
    }

    public io.quarkus.hibernate.orm.panache.PanacheQuery<Pedido> findByStatusAndUserId(StatusPedido status, Long usuarioId) {
        return find("statusPedido = ?1 and usuario.id = ?2", status, usuarioId);
    }

    public io.quarkus.hibernate.orm.panache.PanacheQuery<Pedido> findPedidosPendentes() {
        return find("statusPedido", StatusPedido.PENDENTE);
    }
}
