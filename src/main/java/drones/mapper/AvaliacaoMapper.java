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
            avaliacao.getDataAvaliacao(),
            avaliacao.getUsuario() != null ? avaliacao.getUsuario().getId() : null,
            avaliacao.getDrone() != null ? avaliacao.getDrone().getId() : null
        );
    }
}