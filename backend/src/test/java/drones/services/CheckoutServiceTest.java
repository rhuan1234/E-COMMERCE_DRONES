package drones.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;

import drones.dto.pedidos.CheckoutRequestDTO;
import drones.dto.pedidos.CheckoutResponseDTO;
import drones.dto.pedidos.ItemPedidoRequestDTO;
import drones.exception.ValidationException;
import drones.model.drones.Drone;
import drones.model.usuario.Usuario;
import drones.repository.DroneRepository;
import drones.repository.UsuarioRepository;
import io.quarkus.test.TestTransaction;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

@QuarkusTest
class CheckoutServiceTest {

    @Inject
    CheckoutService checkoutService;

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    DroneRepository droneRepository;

    @Test
    @TestTransaction
    void deveCriarPedidoEFormaDePagamentoCartaoSemDadosFinanceiros() {
        Usuario cliente = usuarioRepository.findByLogin("cliente").orElseThrow();
        Long enderecoId = cliente.getEnderecos().get(0).getId();
        CheckoutRequestDTO requisicao = new CheckoutRequestDTO(
            enderecoId,
            List.of(new ItemPedidoRequestDTO(1L, 1)),
            "CARTAO"
        );

        CheckoutResponseDTO resposta = checkoutService.finalizar(requisicao, "cliente");

        assertEquals("CARTAO", resposta.metodoPagamento());
        assertEquals("PENDENTE", resposta.statusPagamento());
        assertEquals("PENDENTE", resposta.pedido().statusPedido());
        assertNull(resposta.codigoPixDemonstracao());
        assertEquals(1, resposta.pedido().itens().size());
    }

    @Test
    @TestTransaction
    void deveRejeitarEnderecoQueNaoPertenceAoClienteSemDebitarEstoque() {
        Usuario cliente = usuarioRepository.findByLogin("cliente").orElseThrow();
        Drone drone = droneRepository.findById(1L);
        int estoqueAntes = drone.getQuantidadeDisponivel();
        CheckoutRequestDTO requisicao = new CheckoutRequestDTO(
            Long.MAX_VALUE,
            List.of(new ItemPedidoRequestDTO(1L, 1)),
            "PIX"
        );

        assertThrows(ValidationException.class, () -> checkoutService.finalizar(requisicao, cliente.getLogin()));
        assertEquals(estoqueAntes, drone.getQuantidadeDisponivel());
    }
}
