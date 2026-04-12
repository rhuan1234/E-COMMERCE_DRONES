package armas.mapper;

import armas.dto.registro.RegistroRequestDTO;
import armas.dto.registro.RegistroResponseDTO;
import armas.model.registro.Registro;

public class RegistroMapper {
    public static Registro toEntity(RegistroRequestDTO dto){
        Registro registro = new Registro();

        registro.setDataRegistro(dto.dataRegistro());
        registro.setNumeroSerie(dto.numeroSerie());

        return registro;
    }

    public static RegistroResponseDTO toResponseDTO(Registro registro){
        
        return new RegistroResponseDTO(
            registro.getId(),
            registro.getDataRegistro(),
            registro.getNumeroSerie()
        );
    }
}