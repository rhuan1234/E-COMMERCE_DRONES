package armas.mapper;

import armas.dto.fornecedores.TelefoneRequestDTO;
import armas.dto.fornecedores.TelefoneResponseDTO;
import armas.model.fornecedor.Telefone;

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
