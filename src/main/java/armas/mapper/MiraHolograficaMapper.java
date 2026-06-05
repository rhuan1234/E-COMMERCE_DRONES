package armas.mapper;

import armas.dto.mira.MiraHolograficaRequestDTO;
import armas.dto.mira.MiraHolograficaResponseDTO;
import armas.model.mira.MiraHolografica;

public class MiraHolograficaMapper {
    
    public static MiraHolografica toEntity(MiraHolograficaRequestDTO dto) {
        MiraHolografica mira = new MiraHolografica();
        mira.setModelo(dto.modelo());
        mira.setMarca(dto.marca());
        mira.setAumentoMaximo(dto.aumentoMaximo());
        mira.setAlcanceLaser(dto.alcanceLaser());
        mira.setVisaoNoturna(dto.visaoNoturna());
        return mira;
    }

    public static MiraHolograficaResponseDTO toResponseDTO(MiraHolografica mira) {
        return new MiraHolograficaResponseDTO(
            mira.getId(),
            mira.getModelo(),
            mira.getMarca(),
            mira.getAumentoMaximo(),
            mira.getAlcanceLaser(),
            mira.isVisaoNoturna(),
            mira.getFuzis().stream().map(fuzil -> fuzil.getId()).toList()
        );
    }
}
