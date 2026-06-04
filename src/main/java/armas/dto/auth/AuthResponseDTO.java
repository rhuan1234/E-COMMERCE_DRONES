package armas.dto.auth;

public record AuthResponseDTO(
    String token,
    String tipo
) {}