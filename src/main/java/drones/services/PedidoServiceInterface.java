package drones.services;

import java.util.List;

import drones.model.pedido.Pedido;
import drones.model.usuario.Usuario;

public interface PedidoServiceInterface {
    Pedido criar(Usuario usuario, Pedido pedido);
    Pedido buscarPorId(Long id);
    List<Pedido> buscarTodos();
    boolean deletar(Long id, String login);
    List<Pedido> buscarPorUsuarioId(Long usuarioId);
    Pedido cancelar(Long id, String login);
    List<Pedido> findByStatus(String status, String login);
}
