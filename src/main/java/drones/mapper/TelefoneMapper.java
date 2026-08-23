package drones.mapper;

import drones.dto.fornecedores.TelefoneRequestDTO;
import drones.dto.fornecedores.TelefoneResponseDTO;
import drones.model.fornecedor.Telefone;

public class TelefoneMapper {
    
    public static Telefone toEntity(TelefoneRequestDTO dto) {
        Telefone telefone = new Telefone();
        telefone.setNumero(dto.numero());
        return telefone;
    }

    public static TelefoneResponseDTO toResponseDTO(Telefone telefone) {
        return new TelefoneResponseDTO(
            telefone.getId(),
            telefone.getNumero()
            
        );
    }
}
