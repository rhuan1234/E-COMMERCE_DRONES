package armas.services;

import armas.model.pedido.Pedido;
import armas.model.usuario.Usuario;

import java.util.List;

public interface PedidoServiceInterface {
    Pedido criar(Usuario usuario, Pedido pedido);
    Pedido buscarPorId(Long id);
    List<Pedido> buscarTodos();
    boolean deletar(Long id, String login);
    List<Pedido> buscarPorUsuarioId(Long usuarioId);
    Pedido cancelar(Long id, String login);
    List<Pedido> findByStatus(String status, String login);
}
