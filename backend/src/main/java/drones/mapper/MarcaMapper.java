package drones.mapper;

import drones.dto.drones.MarcaRequestDTO;
import drones.dto.drones.MarcaResponseDTO;
import drones.model.drones.Marca;

public class MarcaMapper {

    public static Marca toEntity(MarcaRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        Marca marca = new Marca();
        marca.setNome(dto.nome());
        return marca;
    }

    public static MarcaResponseDTO toResponseDTO(Marca marca) {
        if (marca == null) {
            return null;
        }
        return new MarcaResponseDTO(
            marca.getId(),
            marca.getNome()
        );
    }
}
