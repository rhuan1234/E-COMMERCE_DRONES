package drones.mapper;

import drones.dto.drones.AvaliacaoResponseDTO;
import drones.model.drones.Avaliacao;

public class AvaliacaoMapper {

    private AvaliacaoMapper() {
    }

    public static AvaliacaoResponseDTO toResponseDTO(Avaliacao avaliacao) {
        if (avaliacao == null) {
            return null;
        }

        return new AvaliacaoResponseDTO(
            avaliacao.getId(),
            avaliacao.getNota(),
            avaliacao.getComentario(),
            nomeCliente(avaliacao),
            avaliacao.getDataAvaliacao(),
            avaliacao.getUsuario() != null ? avaliacao.getUsuario().getId() : null,
            avaliacao.getDrone() != null ? avaliacao.getDrone().getId() : null
        );
    }

    private static String nomeCliente(Avaliacao avaliacao) {
        if (avaliacao.getNomeCliente() != null && !avaliacao.getNomeCliente().isBlank()) {
            return avaliacao.getNomeCliente();
        }
        String nomePerfil = avaliacao.getUsuario() != null ? avaliacao.getUsuario().getNomeCompleto() : null;
        return nomePerfil == null || nomePerfil.isBlank() ? "<desconhecido>" : nomePerfil.trim();
    }
}