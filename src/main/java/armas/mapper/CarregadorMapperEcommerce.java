package armas.mapper;

import armas.dto.armas.CarregadorResponseEcommerceDTO;
import armas.model.armas.Carregador;


public class CarregadorMapperEcommerce {
       

    public static CarregadorResponseEcommerceDTO toResponseDTO(Carregador carregador) {
        return new CarregadorResponseEcommerceDTO(
            carregador.getId(),
            carregador.getModelo(),
            carregador.getQtdMunicao(),
            carregador.getMarca()
        );
    }
}
