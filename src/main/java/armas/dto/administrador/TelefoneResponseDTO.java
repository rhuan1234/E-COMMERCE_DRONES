package armas.dto.administrador;

public record TelefoneResponseDTO(
    Long id,
    String numero,
    Long administradorId
) {}
