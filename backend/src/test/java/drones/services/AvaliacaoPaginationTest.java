package drones.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDateTime;
import java.util.List;

import drones.exception.ValidationException;
import drones.mapper.AvaliacaoMapper;
import drones.model.drones.Avaliacao;
import drones.dto.drones.AvaliacaoRequestDTO;
import drones.repository.AvaliacaoRepository;
import drones.repository.DroneRepository;
import drones.repository.UsuarioRepository;
import io.quarkus.test.TestTransaction;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

@QuarkusTest
class AvaliacaoPaginationTest {

    @Inject
    AvaliacaoService avaliacaoService;

    @Inject
    AvaliacaoRepository avaliacaoRepository;

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    DroneRepository droneRepository;

    @Test
    @TestTransaction
    void devePaginarEmGruposDeCincoDaMaisRecenteParaAMaisAntiga() {
        var usuario = usuarioRepository.findByLogin("cliente").orElseThrow();
        var drone = droneRepository.findById(1L);
        LocalDateTime agora = LocalDateTime.now();

        for (int indice = 0; indice < 7; indice++) {
            Avaliacao avaliacao = new Avaliacao();
            avaliacao.setNota(indice % 5 + 1);
            avaliacao.setComentario("Comentário " + indice);
            avaliacao.setNomeCliente("Lucas Silva");
            avaliacao.setDataAvaliacao(agora.plusMinutes(indice));
            avaliacao.setUsuario(usuario);
            avaliacao.setDrone(drone);
            avaliacaoRepository.persist(avaliacao);
        }

        List<Avaliacao> primeiraPagina = avaliacaoService.buscarPorDrone(1L, 0, 5);
        List<Avaliacao> segundaPagina = avaliacaoService.buscarPorDrone(1L, 1, 5);

        assertEquals(5, primeiraPagina.size());
        assertEquals(3, segundaPagina.size());
        assertEquals("Comentário 6", primeiraPagina.get(0).getComentario());
        assertEquals("Comentário 2", primeiraPagina.get(4).getComentario());
        assertEquals("Comentário 1", segundaPagina.get(0).getComentario());
        assertEquals("Comentário 0", segundaPagina.get(1).getComentario());
    }

    @Test
    @TestTransaction
    void deveRejeitarTamanhoDePaginaMaiorQueCinco() {
        assertThrows(ValidationException.class, () -> avaliacaoService.buscarPorDrone(1L, 0, 6));
    }

    @Test
    @TestTransaction
    void deveSalvarNomeDoPerfilNoSnapshotDaAvaliacao() {
        var usuario = usuarioRepository.findByLogin("cliente").orElseThrow();
        usuario.setNomeCompleto("  Nome cadastrado  ");

        Avaliacao avaliacao = avaliacaoService.criar(
                new AvaliacaoRequestDTO(5, "Comentário de teste", 3L),
                "cliente");

        assertEquals("Nome cadastrado", avaliacao.getNomeCliente());
        usuario.setNomeCompleto("Outro nome");
        assertEquals("Nome cadastrado", AvaliacaoMapper.toResponseDTO(avaliacao).nomeCliente());
    }

    @Test
    @TestTransaction
    void deveSalvarDesconhecidoQuandoPerfilNaoTemNome() {
        var usuario = usuarioRepository.findByLogin("cliente").orElseThrow();
        usuario.setNomeCompleto("  ");

        Avaliacao avaliacao = avaliacaoService.criar(
                new AvaliacaoRequestDTO(4, "Comentário sem nome", 3L),
                "cliente");

        assertEquals("<desconhecido>", avaliacao.getNomeCliente());
        assertEquals("<desconhecido>", AvaliacaoMapper.toResponseDTO(avaliacao).nomeCliente());
    }
}
