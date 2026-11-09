package drones.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.TreeSet;

import drones.exception.ValidationException;
import drones.model.drones.Drone;
import drones.model.fornecedor.Endereco;
import drones.model.pedido.ItemPedido;
import drones.model.pedido.PagamentoCartao;
import drones.model.pedido.PagamentoPix;
import drones.model.pedido.Pedido;
import drones.model.pedido.StatusPagamento;
import drones.model.pedido.StatusPedido;
import drones.model.usuario.Usuario;
import drones.repository.PagamentoCartaoRepository;
import drones.repository.PagamentoPixRepository;
import drones.repository.PedidoRepository;
import drones.repository.DroneRepository;

@ApplicationScoped
public class PedidoService implements PedidoServiceInterface {

    @Inject
    PedidoRepository pedidoRepository;

    @Inject
    DroneRepository droneRepository;

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
        return criarComEndereco(usuario, pedido, null);
    }

    @Override
    @Transactional
    public Pedido criar(Usuario usuario, Pedido pedido, Long enderecoId) {
        return criarComEndereco(usuario, pedido, enderecoId);
    }

    private Pedido criarComEndereco(Usuario usuario, Pedido pedido, Long enderecoId) {
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

        Endereco enderecoEntrega = usuario.getEnderecos().stream()
            .filter(endereco -> enderecoId != null
                ? Objects.equals(endereco.getId(), enderecoId)
                : endereco.isPrincipal())
            .findFirst()
            .orElseThrow(() -> new ValidationException(
                enderecoId == null
                    ? "O cliente precisa possuir um endereço principal"
                    : "O endereço selecionado não pertence ao cliente",
                "enderecoId"
            ));

        bloquearDronesDoPedido(pedido);
        for(ItemPedido item : pedido.getItens()) {
            if (item.getDrone() == null) {
                throw new ValidationException("Drone do item não foi encontrado", "droneId");
            }
            if (item.getQuantidade() <= 0) {
                throw new ValidationException("A quantidade deve ser maior que zero", "quantidade");
            }
            if(item.getDrone().getQuantidadeDisponivel() - item.getQuantidade() < 0) {
                throw new ValidationException(
                    "Quantidade solicitada para o drone id: " + item.getDrone().getId() + " excede a quantidade disponível em estoque (disponível: " + item.getDrone().getQuantidadeDisponivel() +")"
                );
            }
            item.getDrone().setQuantidadeDisponivel(item.getDrone().getQuantidadeDisponivel() - item.getQuantidade());
        }

        pedido.setUsuario(usuario);
        LocalDateTime agora = LocalDateTime.now();
        pedido.getItens().forEach(item -> aplicarPromocao(item, agora));
        pedido.calcularValorTotal();
        pedido.getItens().forEach(item -> item.setPedido(pedido));
        pedido.setStatusPedido(StatusPedido.PENDENTE);
        pedido.setDataPedido(LocalDateTime.now());
        pedido.setRuaEntrega(enderecoEntrega.getRua());
        pedido.setBairroEntrega(enderecoEntrega.getBairro());
        pedido.setCidadeEntrega(enderecoEntrega.getCidade().getNome());
        pedido.setEstadoEntrega(enderecoEntrega.getCidade().getEstado().getNome());
        pedido.setCepEntrega(enderecoEntrega.getCep());
        pedidoRepository.persist(pedido);

        return pedido;
    }

    private void bloquearDronesDoPedido(Pedido pedido) {
        TreeSet<Long> droneIds = new TreeSet<>();
        for (ItemPedido item : pedido.getItens()) {
            if (item.getDrone() != null && item.getDrone().getId() != null) {
                droneIds.add(item.getDrone().getId());
            }
        }

        Map<Long, Drone> dronesBloqueados = new HashMap<>();
        for (Long droneId : droneIds) {
            Drone drone = droneRepository.findByIdForUpdate(droneId);
            if (drone == null) {
                throw new ValidationException("Drone não encontrado", "droneId");
            }
            dronesBloqueados.put(droneId, drone);
        }

        for (ItemPedido item : pedido.getItens()) {
            if (item.getDrone() != null && item.getDrone().getId() != null) {
                item.setDrone(dronesBloqueados.get(item.getDrone().getId()));
            }
        }
    }

    private void aplicarPromocao(ItemPedido item, LocalDateTime agora) {
        double precoOriginal = item.getDrone().getPreco();
        item.setPrecoUnitario(precoOriginal);

        if (item.getDrone().getPromocao() == null) {
            return;
        }

        var promocao = item.getDrone().getPromocao();
        if (promocao.getDataInicio() == null || promocao.getDataFim() == null
                || agora.isBefore(promocao.getDataInicio())
                || agora.isAfter(promocao.getDataFim())
                || promocao.getPercentualDesconto() == null) {
            return;
        }

        double percentual = promocao.getPercentualDesconto().doubleValue();
        item.setPrecoUnitario(precoOriginal * (1 - percentual / 100));
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
        return buscarTodos(0, 10);
    }

    @Override
    public List<Pedido> buscarTodos(int page, int pageSize) {
        List<Pedido> pedidos = pedidoRepository.findAll().page(page, pageSize).list();
        if (pedidos.isEmpty()) {
            throw new ValidationException("Nenhum pedido encontrado");
        }
        return pedidos;
    }

    @Override
    public long count() {
        return pedidoRepository.count();
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
        return buscarPorUsuarioId(usuarioId, 0, 10);
    }

    @Override
    public List<Pedido> buscarPorUsuarioId(Long usuarioId, int page, int pageSize) {
        return pedidoRepository.findByUsuarioId(usuarioId).page(page, pageSize).list();
    }

    @Override
    public long countPorUsuarioId(Long usuarioId) {
        return pedidoRepository.findByUsuarioId(usuarioId).count();
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
            item.getDrone().setQuantidadeDisponivel(item.getDrone().getQuantidadeDisponivel() + item.getQuantidade());
        }
        
        pedidoRepository.persist(pedido);
        return pedido;
    }

    @Override
    public List<Pedido> findByStatus(String status, String login) {
        return findByStatus(status, login, 0, 10);
    }

    @Override
    public List<Pedido> findByStatus(String status, String login, int page, int pageSize) {
        Long userId = usuarioService.buscarPorLogin(login).getId();
        StatusPedido statusPedido = validarStatus(status);
        return pedidoRepository.findByStatusAndUserId(statusPedido, userId).page(page, pageSize).list();
    }

    @Override
    public long countByStatus(String status, String login) {
        Long userId = usuarioService.buscarPorLogin(login).getId();
        StatusPedido statusPedido = validarStatus(status);
        return pedidoRepository.findByStatusAndUserId(statusPedido, userId).count();
    }

    private StatusPedido validarStatus(String status) {
        if(status == null || status.isBlank()) {
            throw new ValidationException("Status é obrigatório");
        }
        try {
            return StatusPedido.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Status inválido. Valores permitidos: PENDENTE, CANCELADO, PAGO");
        }
    }

    @Override
    public List<Pedido> listarPedidosPendentes() {
        return listarPedidosPendentes(0, 10);
    }

    @Override
    public List<Pedido> listarPedidosPendentes(int page, int pageSize) {
        return pedidoRepository.findPedidosPendentes().page(page, pageSize).list();
    }

    @Override
    public long countPedidosPendentes() {
        return pedidoRepository.findPedidosPendentes().count();
    }
}