package drones.dto.auth;

import java.util.Set;

import drones.model.usuario.Perfil;

public record AuthUserResponseDTO(
    Long id,
    String keycloakId,
    String login,
    String email,
    String nomeCompleto,
    Perfil perfil,
    Set<String> roles
) {}
