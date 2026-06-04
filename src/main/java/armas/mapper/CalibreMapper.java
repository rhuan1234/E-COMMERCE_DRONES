package armas.mapper;

import armas.dto.armas.CalibreRequestDTO;
import armas.dto.armas.CalibreResponseDTO;
import armas.model.armas.Calibre;

public class CalibreMapper {
    public static Calibre toEntity(CalibreRequestDTO dto){
        Calibre calibre = new Calibre();
        calibre.setNome(dto.nome());
        calibre.setMarca(dto.marca());
        return calibre;
    }

    public static CalibreResponseDTO toResponseDTO(Calibre calibre){
        return new CalibreResponseDTO(
            calibre.getId(),
            calibre.getNome(),
            calibre.getMarca(),
            calibre.getFuzis().stream().map(fuzil -> fuzil.getId()).toList()
        );
    }
}