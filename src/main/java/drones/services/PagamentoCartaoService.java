package drones.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

import org.eclipse.microprofile.jwt.JsonWebToken;

import drones.exception.ValidationException;
import drones.model.pedido.PagamentoCartao;
import drones.model.pedido.PagamentoPix;
import drones.model.pedido.Pedido;
import drones.model.pedido.StatusPagamento;
import drones.model.pedido.StatusPedido;
import drones.model.usuario.Usuario;
import drones.repository.PagamentoCartaoRepository;
import drones.repository.PagamentoPixRepository;
import drones.repository.PedidoRepository;
import drones.repository.UsuarioRepository;

@ApplicationScoped
public class PagamentoCartaoService implements PagamentoCartaoServiceInterface {

    @Inject
    PagamentoCartaoRepository pagamentoCartaoRepository;

    @Inject
    PedidoRepository pedidoRepository;

    @Inject
    JsonWebToken jwt;

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    PagamentoPixRepository pagamentoPixRepository;

    @Inject
    PedidoService pedidoService;

    @Override
    @Transactional
    public PagamentoCartao criar(PagamentoCartao pagamentoCartao, Long pedidoId, String login) {
        
        if (pedidoId == null) {
            throw new ValidationException("Pedido é obrigatório", "pedidoId");
        }

        Pedido pedido = pedidoRepository.findById(pedidoId);
        if (pedido == null) {
            throw new ValidationException("Pedido não encontrado", "pedidoId");
        }

        Usuario cliente = usuarioRepository.findByLogin(login).orElseThrow(() -> new ValidationException("Cliente não encontrado", "login"));

        if (!pedido.getUsuario().getId().equals(cliente.getId())) {
            throw new ValidationException("Pedido não pertence ao usuário ou não existe", "pedidoId");
        }
         if(pedido.getStatusPedido() == StatusPedido.PENDENTE) {
            throw new ValidationException("Pedido precisa estar aprovado para criar o pagamento", "pedidoId");
        }
        if(pedido.getStatusPedido() == StatusPedido.CANCELADO) {
            throw new ValidationException("Pedido foi cancelado e não pode ser pago", "pedidoId");
        }
        if(pedido.getStatusPedido() == StatusPedido.PAGO) {
            throw new ValidationException("Pedido já foi pago", "pedidoId");
        }
        if(pedido.getStatusPedido() == StatusPedido.REPROVADO) {
            throw new ValidationException("Pedido foi reprovado e não pode ser pago", "pedidoId");
        }
        PagamentoPix pagamentoPixExistente = pagamentoPixRepository.findByPedidoIdPix(pedidoId);
        if (pagamentoPixExistente != null) {
            throw new ValidationException("Pagamento já existe para este pedido", "pedidoId");
        }
        PagamentoCartao pagamentoCartaoExistente = pagamentoCartaoRepository.findByPedidoIdCartao(pedidoId);
        if (pagamentoCartaoExistente != null) {
            throw new ValidationException("Pagamento já existe para este pedido", "pedidoId");
        }
        pagamentoCartao.setValor(pedido.getValorTotal());
        pagamentoCartao.setPedido(pedido);
        pagamentoCartao.setStatusPagamento(StatusPagamento.PENDENTE);
        pagamentoCartaoRepository.persist(pagamentoCartao);
        return pagamentoCartao;
    }

    @Override
    @Transactional
    public void pagarCartao(Long id, String login) {
        Usuario cliente = usuarioRepository.findByLogin(login).orElseThrow(() -> new ValidationException("Cliente não encontrado", "login"));
        PagamentoCartao pagamentoCartao = pagamentoCartaoRepository.findById(id);
        if (pagamentoCartao == null || !pagamentoCartao.getPedido().getUsuario().getId().equals(cliente.getId())) {
            throw new ValidationException("Pagamento não encontrado ou não pertence ao usuário", "id");
        }
        if (pagamentoCartao.getStatusPagamento() != StatusPagamento.PENDENTE) {
            throw new ValidationException("Pagamento já foi processado", "id");
        }
        if(pagamentoCartao.getPedido().getStatusPedido() == StatusPedido.PENDENTE) {
            throw new ValidationException("O pedido precisa ser aprovado antes de ser pago", "id");
        }
        if(pagamentoCartao.getPedido().getStatusPedido() == StatusPedido.CANCELADO) {
            throw new ValidationException("O pedido foi cancelado e não pode ser pago", "id");
        }
        if(pagamentoCartao.getPedido().getStatusPedido() == StatusPedido.REPROVADO) {
            throw new ValidationException("O pedido foi reprovado e não pode ser pago", "id");
        }
        if(pagamentoCartao.getValor() == null || pagamentoCartao.getValor().compareTo(pagamentoCartao.getPedido().getValorTotal()) != 0) {
            throw new ValidationException("Valor do pagamento deve ser igual ao valor total do pedido", "valor");
        }
        if(pagamentoCartao.getPedido().getStatusPedido() == StatusPedido.PAGO) {
            throw new ValidationException("O pedido já foi pago", "id");
        }
        pagamentoCartao.getPedido().setStatusPedido(StatusPedido.PAGO);
        pagamentoCartao.setStatusPagamento(StatusPagamento.APROVADO);
        pagamentoCartaoRepository.persist(pagamentoCartao);
    }

    @Override
    @Transactional
    public void cancelarCartao(Long id, String login) {
        Usuario cliente = usuarioRepository.findByLogin(login).orElseThrow(() -> new ValidationException("Cliente não encontrado", "login"));
        PagamentoCartao pagamentoCartao = pagamentoCartaoRepository.findById(id);
        if (pagamentoCartao == null || !pagamentoCartao.getPedido().getUsuario().getId().equals(cliente.getId())) {
            throw new ValidationException("Pagamento não encontrado ou não pertence ao usuário", "id");
        }
        if (pagamentoCartao.getStatusPagamento() == StatusPagamento.CANCELADO) {
            throw new ValidationException("Pagamento já foi cancelado", "id");
        }
        pedidoService.cancelar(pagamentoCartao.getPedido().getId(), login);
        //pagamentoCartao.getPedido().setStatusPedido(StatusPedido.CANCELADO);
        pagamentoCartao.setStatusPagamento(StatusPagamento.CANCELADO);
        pagamentoCartaoRepository.persist(pagamentoCartao);
    }

    @Override
    public PagamentoCartao buscarPorId(Long id, String login) {
         Usuario cliente = usuarioRepository.findByLogin(login).orElseThrow(() -> new ValidationException("Cliente não encontrado", "login"));
         PagamentoCartao pagamentoCartao = pagamentoCartaoRepository.findById(id);
         if (pagamentoCartao == null || !pagamentoCartao.getPedido().getUsuario().getId().equals(cliente.getId())) {
             throw new ValidationException("Pagamento não encontrado ou não pertence ao usuário", "id");
         }
        return pagamentoCartaoRepository.findById(id);
    }

    @Override
    public List<PagamentoCartao> buscarTodos(String login) {
         Usuario cliente = usuarioRepository.findByLogin(login).orElseThrow(() -> new ValidationException("Cliente não encontrado", "login"));
         List<PagamentoCartao> pagamentos = pagamentoCartaoRepository.listAll();
         pagamentos.removeIf(p -> !p.getPedido().getUsuario().getId().equals(cliente.getId()));
         return pagamentos;
    }


    @Override
    public List<PagamentoCartao> buscarPorPedidoId(Long pedidoId, String login) {
        Usuario cliente = usuarioRepository.findByLogin(login).orElseThrow(() -> new ValidationException("Cliente não encontrado", "login"));
        Pedido pedido = pedidoRepository.findById(pedidoId);
        if (pedido == null || !pedido.getUsuario().getId().equals(cliente.getId())) {
            throw new ValidationException("Pedido não encontrado ou não pertence ao usuário", "pedidoId");
        }
        return pagamentoCartaoRepository.findByPedidoId(pedidoId);
    }
}
