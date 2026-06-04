package armas.mapper;

import armas.dto.armas.CarregadorRequestDTO;
import armas.dto.armas.CarregadorResponseDTO;
import armas.model.armas.Carregador;
import armas.model.armas.Fuzil;

public class CarregadorMapper {
    
    public static Carregador toEntity(CarregadorRequestDTO dto) {
        Carregador carregador = new Carregador();
        carregador.setModelo(dto.modelo());
        carregador.setQtdMunicao(dto.qtdMunicao());
        carregador.setMarca(dto.marca());
        return carregador;
    }

    public static CarregadorResponseDTO toResponseDTO(Carregador carregador) {
        return new CarregadorResponseDTO(
            carregador.getId(),
            carregador.getModelo(),
            carregador.getQtdMunicao(),
            carregador.getMarca(),
            carregador.getFuzis().stream().map(Fuzil::getId).toList()
        );
    }
}
