package drones.mapper;

import drones.dto.drones.ModeloRequestDTO;
import drones.dto.drones.ModeloResponseDTO;
import drones.model.drones.Modelo;
import drones.repository.MarcaRepository;

public class ModeloMapper {

    public static Modelo toEntity(ModeloRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        Modelo modelo = new Modelo();
        modelo.setNome(dto.nome());
        if (dto.marcaId() != null) {
            MarcaRepository marcaRepository = new MarcaRepository();
            modelo.setMarca(marcaRepository.findById(dto.marcaId()));
        }
        return modelo;
    }

    public static ModeloResponseDTO toResponseDTO(Modelo modelo) {
        if (modelo == null) {
            return null;
        }
        return new ModeloResponseDTO(
            modelo.getId(),
            modelo.getNome(),
            modelo.getMarca() != null ? modelo.getMarca().getId() : null,
            MarcaMapper.toResponseDTO(modelo.getMarca())
        );
    }
}
