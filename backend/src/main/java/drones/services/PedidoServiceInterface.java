package drones.services;

import java.util.List;

import drones.model.pedido.Pedido;
import drones.model.usuario.Usuario;

public interface PedidoServiceInterface {
    Pedido criar(Usuario usuario, Pedido pedido);
    Pedido buscarPorId(Long id);
    List<Pedido> buscarTodos();
    List<Pedido> buscarTodos(int page, int pageSize);
    long count();
    boolean deletar(Long id, String login);
    List<Pedido> buscarPorUsuarioId(Long usuarioId);
    List<Pedido> buscarPorUsuarioId(Long usuarioId, int page, int pageSize);
    long countPorUsuarioId(Long usuarioId);
    Pedido cancelar(Long id, String login);
    List<Pedido> findByStatus(String status, String login);
    List<Pedido> findByStatus(String status, String login, int page, int pageSize);
    long countByStatus(String status, String login);
    List<Pedido> listarPedidosPendentes();
    List<Pedido> listarPedidosPendentes(int page, int pageSize);
    long countPedidosPendentes();
}
