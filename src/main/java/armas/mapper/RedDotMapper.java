package armas.mapper;

import armas.dto.mira.RedDotRequestDTO;
import armas.dto.mira.RedDotResponseDTO;
import armas.model.mira.RedDot;

public class RedDotMapper {
    
    public static RedDot toEntity(RedDotRequestDTO dto) {
        RedDot mira = new RedDot();
        mira.setModelo(dto.modelo());
        mira.setMarca(dto.marca());
        mira.setAumentoMaximo(dto.aumentoMaximo());
        mira.setNiveisBrilho(dto.niveisBrilho());
        mira.setDuracaoBateria(dto.duracaoBateria());
        return mira;
    }

    public static RedDotResponseDTO toResponseDTO(RedDot mira) {
        return new RedDotResponseDTO(
            mira.getId(),
            mira.getModelo(),
            mira.getMarca(),
            mira.getAumentoMaximo(),
            mira.getNiveisBrilho(),
            mira.getDuracaoBateria()
        );
    }
}
