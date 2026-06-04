package armas.services;

import armas.exception.ValidationException;
import armas.model.pedido.PagamentoCartao;
import armas.model.pedido.PagamentoPix;
import armas.model.pedido.Pedido;
import armas.model.pedido.StatusPagamento;
import armas.model.pedido.StatusPedido;
import armas.model.usuario.Usuario;
import armas.repository.PagamentoCartaoRepository;
import armas.repository.PagamentoPixRepository;
import armas.repository.PedidoRepository;
import armas.repository.UsuarioRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class PagamentoPixService implements PagamentoPixServiceInterface {

    @Inject
    PagamentoPixRepository pagamentoPixRepository;

    @Inject
    PedidoRepository pedidoRepository;

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    PagamentoCartaoRepository pagamentoCartaoRepository;

    @Inject
    PedidoService pedidoService;

    @Override
    @Transactional
    public PagamentoPix criar(Long pedidoId, String login) {
        PagamentoPix pagamentoPix = new PagamentoPix();
        if (pedidoId == null) {
            throw new ValidationException("Pedido é obrigatório", "pedidoId");
        }

        Pedido pedido = pedidoRepository.findById(pedidoId);
        if (pedido == null) {
            throw new ValidationException("Pedido não encontrado", "pedidoId");
        }
        
        Usuario cliente = usuarioRepository.findByLogin(login)
        .orElseThrow(() -> new ValidationException("Usuário não encontrado", "login"));

        if(!pedido.getUsuario().getId().equals(cliente.getId())) {
            throw new ValidationException("Pedido não pertence ao usuário ou não existe", "pedidoId");
        }
        pagamentoPix.setValor(pedido.getValorTotal());
        if(pagamentoPix.getValor() == null || pagamentoPix.getValor().compareTo(pedido.getValorTotal()) != 0) {
            throw new ValidationException("Valor do pagamento deve ser igual ao valor total do pedido", "valor");
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
        pagamentoPix.setStatusPagamento(StatusPagamento.PENDENTE);
        pagamentoPix.setPedido(pedido);
        pagamentoPix.setChavePix(UUID.randomUUID().toString());
        pagamentoPixRepository.persist(pagamentoPix);
        return pagamentoPix;
    }

    @Override
    public PagamentoPix buscarPorId(Long id, String login) {
            Usuario cliente = usuarioRepository.findByLogin(login)
            .orElseThrow(() -> new ValidationException("Usuário não encontrado", "login"));
            PagamentoPix pagamentoPix = pagamentoPixRepository.findById(id);
            if (pagamentoPix == null || !pagamentoPix.getPedido().getUsuario().getId().equals(cliente.getId())) {
                throw new ValidationException("Pagamento não encontrado ou não pertence ao usuário", "id");
            }
        return pagamentoPixRepository.findById(id);
    }

    @Override
    public List<PagamentoPix> buscarTodos(String login) {
        Usuario cliente = usuarioRepository.findByLogin(login).orElseThrow(() -> new ValidationException("Cliente não encontrado", "login"));
        List<PagamentoPix> pagamentos = pagamentoPixRepository.listAll();
        pagamentos.removeIf(p -> !p.getPedido().getUsuario().getId().equals(cliente.getId()));
        return pagamentos;
    }

    @Override
    public List<PagamentoPix> buscarPorPedidoId(Long pedidoId, String login) {
        Usuario cliente = usuarioRepository.findByLogin(login).orElseThrow(() -> new ValidationException("Cliente não encontrado", "login"));
        Pedido pedido = pedidoRepository.findById(pedidoId);
        if (pedido == null || !pedido.getUsuario().getId().equals(cliente.getId())) {
            throw new ValidationException("Pedido não encontrado ou não pertence ao usuário", "pedidoId");
        }
        return pagamentoPixRepository.findByPedidoId(pedidoId);
    }

    @Override
    @Transactional
    public void pagarPix(Long id, String login) {
        Usuario cliente = usuarioRepository.findByLogin(login).orElseThrow(() -> new ValidationException("Cliente não encontrado", "login"));
        PagamentoPix pagamentoPix = pagamentoPixRepository.findById(id);
        if (pagamentoPix == null || !pagamentoPix.getPedido().getUsuario().getId().equals(cliente.getId())) {
            throw new ValidationException("Pagamento não encontrado ou não pertence ao usuário", "id");
        }
        if (pagamentoPix.getStatusPagamento() != StatusPagamento.PENDENTE) {
            throw new ValidationException("Pagamento ou Pedido já foi processado", "id");
        }
        if(pagamentoPix.getPedido().getStatusPedido() == StatusPedido.PENDENTE) {
            throw new ValidationException("O pedido precisa ser aprovado antes de ser pago", "id");
        }
        if(pagamentoPix.getPedido().getStatusPedido() == StatusPedido.CANCELADO) {
            throw new ValidationException("O pedido foi cancelado e não pode ser pago", "id");
        }
        if(pagamentoPix.getPedido().getStatusPedido() == StatusPedido.REPROVADO) {
            throw new ValidationException("O pedido foi reprovado e não pode ser pago", "id");
        }
        if(pagamentoPix.getValor() == null || pagamentoPix.getValor().compareTo(pagamentoPix.getPedido().getValorTotal()) != 0) {
            throw new ValidationException("Valor do pagamento deve ser igual ao valor total do pedido", "valor");
        }
        if(pagamentoPix.getPedido().getStatusPedido() == StatusPedido.PAGO) {
            throw new ValidationException("O pedido já foi pago", "id");
        }
        pagamentoPix.setStatusPagamento(StatusPagamento.APROVADO);
        pagamentoPix.getPedido().setStatusPedido(StatusPedido.PAGO);
        pagamentoPixRepository.persist(pagamentoPix);
    }

    @Override
    @Transactional
    public void cancelarPix(Long id, String login) {
        Usuario cliente = usuarioRepository.findByLogin(login).orElseThrow(() -> new ValidationException("Cliente não encontrado", "login"));
        PagamentoPix pagamentoPix = pagamentoPixRepository.findById(id);
        if (pagamentoPix == null || !pagamentoPix.getPedido().getUsuario().getId().equals(cliente.getId())) {
            throw new ValidationException("Pagamento não encontrado ou não pertence ao usuário", "id");
        }
        if (pagamentoPix.getStatusPagamento() == StatusPagamento.CANCELADO) {
            throw new ValidationException("Pagamento já foi cancelado", "id");
        }
        
        pagamentoPix.setStatusPagamento(StatusPagamento.CANCELADO);
        pedidoService.cancelar(pagamentoPix.getPedido().getId(), login);
        //pagamentoPix.getPedido().setStatusPedido(StatusPedido.CANCELADO);
        pagamentoPixRepository.persist(pagamentoPix);
    }
}
