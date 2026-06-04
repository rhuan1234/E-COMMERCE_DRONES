package armas.mapper;

import armas.dto.armas.CalibreResponseEcommerceDTO;
import armas.model.armas.Calibre;

public class CalibreMapperEcommerce {

    public static CalibreResponseEcommerceDTO toResponseDTO(Calibre calibre){
        return new CalibreResponseEcommerceDTO(
            calibre.getId(),
            calibre.getNome(),
            calibre.getMarca()
        );
    }
}
