package drones.services;

import drones.dto.pedidos.CheckoutRequestDTO;
import drones.dto.pedidos.CheckoutResponseDTO;
import drones.dto.pedidos.PedidoRequestDTO;
import drones.exception.UnauthorizedException;
import drones.exception.ValidationException;
import drones.mapper.PedidoMapper;
import drones.model.pedido.PagamentoCartao;
import drones.model.pedido.PagamentoPix;
import drones.model.pedido.Pedido;
import drones.model.usuario.Usuario;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class CheckoutService implements CheckoutServiceInterface {

    @Inject
    AdminServiceInterface usuarioService;

    @Inject
    PedidoServiceInterface pedidoService;

    @Inject
    PagamentoPixServiceInterface pagamentoPixService;

    @Inject
    PagamentoCartaoServiceInterface pagamentoCartaoService;

    @Override
    @Transactional
    public CheckoutResponseDTO finalizar(CheckoutRequestDTO dados, String login) {
        if (dados == null) {
            throw new ValidationException("Dados do checkout são obrigatórios");
        }
        if (login == null || login.isBlank()) {
            throw new UnauthorizedException("Usuário não autenticado");
        }

        Usuario usuario = usuarioService.buscarPorLogin(login);
        if (usuario == null) {
            throw new ValidationException("Usuário não encontrado", "usuario");
        }

        Pedido pedido = pedidoService.criar(
            usuario,
            PedidoMapper.toEntity(new PedidoRequestDTO(dados.itens())),
            dados.enderecoId()
        );

        if ("PIX".equals(dados.metodoPagamento())) {
            PagamentoPix pagamento = pagamentoPixService.criar(pedido.getId(), login);
            return new CheckoutResponseDTO(
                PedidoMapper.toResponseDTO(pedido),
                "PIX",
                pagamento.getId(),
                pagamento.getStatusPagamento().name(),
                pagamento.getChavePix()
            );
        }
        if ("CARTAO".equals(dados.metodoPagamento())) {
            PagamentoCartao pagamento = pagamentoCartaoService.criar(pedido.getId(), login);
            return new CheckoutResponseDTO(
                PedidoMapper.toResponseDTO(pedido),
                "CARTAO",
                pagamento.getId(),
                pagamento.getStatusPagamento().name(),
                null
            );
        }

        throw new ValidationException("A forma de pagamento deve ser PIX ou CARTAO", "metodoPagamento");
    }
}
