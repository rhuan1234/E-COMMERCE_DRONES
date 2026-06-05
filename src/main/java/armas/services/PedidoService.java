package armas.services;

import armas.exception.ValidationException;
import armas.model.fornecedor.Endereco;
import armas.model.pedido.ItemPedido;
import armas.model.pedido.PagamentoCartao;
import armas.model.pedido.PagamentoPix;
import armas.model.pedido.Pedido;
import armas.model.pedido.StatusPagamento;
import armas.model.pedido.StatusPedido;
import armas.model.usuario.Usuario;
import armas.repository.PagamentoCartaoRepository;
import armas.repository.PagamentoPixRepository;
import armas.repository.PedidoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class PedidoService implements PedidoServiceInterface {

    @Inject
    PedidoRepository pedidoRepository;

    @Inject
    AdminServiceInterface usuarioService;

    @Inject
    ClienteServiceInterface clienteService;

    @Inject
    PagamentoCartaoRepository pagamentoCartaoRepository;

    @Inject
    PagamentoPixRepository pagamentoPixRepository;

    @Override
    @Transactional
    public Pedido criar(Usuario usuario,Pedido pedido) {
        if(usuario.getNomeCompleto() == null ||
       usuario.getNomeCompleto().isBlank()) {

        throw new ValidationException(
            "Nome completo é obrigatório"
        );
    }

        if(usuario.getCpf() == null ||
        usuario.getCpf().isBlank()) {

            throw new ValidationException(
                "CPF é obrigatório"
            );
        }

        if(usuario.getEnderecos() == null ||
        usuario.getEnderecos().isEmpty()) {

            throw new ValidationException(
                "Usuário deve possuir endereço"
            );
        }

        if(pedido.getItens() == null || pedido.getItens().isEmpty()){
            throw new ValidationException(
                "O pedido precisa possui pelo menos 1 item"
            );
        }

        for(ItemPedido item : pedido.getItens()) {
            if(item.getFuzil().getQuantidadeDisponivel() - item.getQuantidade() < 0) {
                throw new ValidationException(
                    "Quantidade solicitada para o fuzil id: " + item.getFuzil().getId() + " excede a quantidade disponível em estoque (disponível: " + item.getFuzil().getQuantidadeDisponivel() +")"
                );
            }
            item.getFuzil().setQuantidadeDisponivel(item.getFuzil().getQuantidadeDisponivel() - item.getQuantidade());
        }

        pedido.setUsuario(usuario);
        pedido.getItens().forEach(item -> item.setPrecoUnitario(item.getFuzil().getPreco()));
        pedido.calcularValorTotal();
        pedido.getItens().forEach(item -> item.setPedido(pedido));
        pedido.setStatusPedido(StatusPedido.PENDENTE);
        pedido.setDataPedido(LocalDateTime.now());
        for(Endereco endereco : usuario.getEnderecos()) {
            if(endereco.isPrincipal()) {
                pedido.setRuaEntrega(endereco.getRua());
                pedido.setBairroEntrega(endereco.getBairro());
                pedido.setCidadeEntrega(endereco.getCidade());
                pedido.setEstadoEntrega(endereco.getEstado());
                pedido.setCepEntrega(endereco.getCep());
                break;
            }
        }
        pedidoRepository.persist(pedido);

        return pedido;
    }

    @Override
    public Pedido buscarPorId(Long id) {
        if (id == null || id <= 0) {
            throw new ValidationException("O id do pedido é obrigatório e deve ser maior que zero");
        }
        Pedido pedido = pedidoRepository.findById(id);
        if (pedido == null) {
            throw new ValidationException("Pedido não encontrado para o id informado");
        }
        return pedido;
    }

    @Override
    public List<Pedido> buscarTodos() {
        List<Pedido> pedidos = pedidoRepository.listAll();
        if (pedidos.isEmpty()) {
            throw new ValidationException("Nenhum pedido encontrado");
        }
        return pedidos;
    }

   

    @Override
    @Transactional
    public boolean deletar(Long id, String login) {
        Pedido pedido = pedidoRepository.findById(id);
        if (pedido == null) {
            return false;
        }
        if(pedido.getUsuario() == null || !pedido.getUsuario().getLogin().equals(login)) {
            return false;
        }
        pedidoRepository.delete(pedido);
        return true;
    }

    @Override
    public List<Pedido> buscarPorUsuarioId(Long usuarioId) {
        return pedidoRepository.find("usuario.id", usuarioId).list();
    }

    @Override
    @Transactional
    public Pedido cancelar(Long id, String login) {
        Pedido pedido = pedidoRepository.findById(id);
        if(pedido == null || pedido.getUsuario() == null || !pedido.getUsuario().getLogin().equals(login) ) {
            throw new ValidationException("Pedido não encontrado para o usuário ou não existe");
        }
        if(pedido.getStatusPedido() == StatusPedido.CANCELADO) {
            throw new ValidationException("Pedido já está cancelado");
        }
        PagamentoCartao pagamentoCartao = pagamentoCartaoRepository.findByPedidoIdCartao(pedido.getId());
        if(pagamentoCartao != null) {
            pagamentoCartao.setStatusPagamento(StatusPagamento.CANCELADO);
        }
        PagamentoPix pagamentoPix = pagamentoPixRepository.findByPedidoIdPix(pedido.getId());
        if(pagamentoPix != null) {
            pagamentoPix.setStatusPagamento(StatusPagamento.CANCELADO);
        }
        pedido.setStatusPedido(StatusPedido.CANCELADO);
        for(ItemPedido item : pedido.getItens()) {
            item.getFuzil().setQuantidadeDisponivel(item.getFuzil().getQuantidadeDisponivel() + item.getQuantidade());
        }
        
        pedidoRepository.persist(pedido);
        return pedido;
    }

    @Override
    public List<Pedido> findByStatus(String status, String login) {
        Long userId = usuarioService.buscarPorLogin(login).getId();
        if(status == null || status.isBlank()) {
            throw new ValidationException("Status é obrigatório");
        }
        if(!status.equalsIgnoreCase("PENDENTE") &&
           !status.equalsIgnoreCase("CANCELADO") &&
           !status.equalsIgnoreCase("APROVADO") &&
           !status.equalsIgnoreCase("REPROVADO") &&
           !status.equalsIgnoreCase("PAGO")) {
            throw new ValidationException("Status inválido. Valores permitidos: PENDENTE, CANCELADO, APROVADO, REPROVADO, PAGO");
        }
        List<Pedido> pedidos = pedidoRepository.findAllByUserId(userId);
        return pedidos.stream()
                .filter(p -> p.getStatusPedido().name().equalsIgnoreCase(status))
                .toList();
    }

    public Pedido aprovarPedido(Long id) {
        Pedido pedido = pedidoRepository.findById(id);
        if(pedido == null) {
            throw new ValidationException("Pedido não encontrado para o id informado");
        }
        if(pedido.getStatusPedido() == StatusPedido.CANCELADO) {
            throw new ValidationException("Pedido já está cancelado");
        }
        if(pedido.getStatusPedido() == StatusPedido.PAGO) {
            throw new ValidationException("O pedido já foi pago e não pode ser aprovado");
        }
        if(pedido.getStatusPedido() == StatusPedido.REPROVADO) {
            throw new ValidationException("O pedido já foi reprovado e não pode ser aprovado");
        }
        pedido.setStatusPedido(StatusPedido.APROVADO);
        pedidoRepository.persist(pedido);
        return pedido;
    }

    public List<Pedido> listarPedidosPendentes() {
        List<Pedido> pedidos = pedidoRepository.listarPedidosPendentes();
        return pedidos;
    }

    public Pedido reprovarPedido(Long id) {
        Pedido pedido = pedidoRepository.findById(id);
        if(pedido == null) {
            throw new ValidationException("Pedido não encontrado para o id informado");
        }
        if(pedido.getStatusPedido() == StatusPedido.CANCELADO) {
            throw new ValidationException("Pedido já está cancelado");
        }
        if(pedido.getStatusPedido() == StatusPedido.PAGO) {
            throw new ValidationException("O pedido já foi pago e não pode ser reprovado");
        }
        if(pedido.getStatusPedido() == StatusPedido.REPROVADO) {
            throw new ValidationException("O pedido já foi reprovado e não pode ser reprovado novamente");
        }
        pedido.setStatusPedido(StatusPedido.REPROVADO);
        for(ItemPedido item : pedido.getItens()) {
            item.getFuzil().setQuantidadeDisponivel(item.getFuzil().getQuantidadeDisponivel() + item.getQuantidade());
        }
        pedidoRepository.persist(pedido);
        return pedido;
    }
}