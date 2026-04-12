package armas.mapper;

import armas.dto.administrador.TelefoneRequestDTO;
import armas.dto.administrador.TelefoneResponseDTO;
import armas.model.administrador.Telefone;

public class TelefoneMapper {
    
    public static Telefone toEntity(TelefoneRequestDTO dto) {
        Telefone telefone = new Telefone();
        telefone.setNumero(dto.numero());
        return telefone;
    }

    public static TelefoneResponseDTO toResponseDTO(Telefone telefone) {
        return new TelefoneResponseDTO(
            telefone.getId(),
            telefone.getNumero(),
            telefone.getAdministrador() != null ? telefone.getAdministrador().getId() : null
        );
    }
}
