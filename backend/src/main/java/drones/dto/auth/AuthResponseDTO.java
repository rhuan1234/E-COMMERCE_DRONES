package drones.dto.auth;

public record AuthResponseDTO(
    String token,
    String tipo,
    String refreshToken,
    Long expiresIn,
    AuthUserResponseDTO usuario
) {}
