package drones.dto.usuarios;

import drones.model.usuario.Perfil;

public record UsuarioResponseDTO(
    Long id,
    String login,
    String email,
    Perfil perfil
) {}