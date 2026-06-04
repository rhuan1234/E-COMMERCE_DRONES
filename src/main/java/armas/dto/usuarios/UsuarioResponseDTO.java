package armas.dto.usuarios;

import armas.model.usuario.Perfil;

public record UsuarioResponseDTO(
    Long id,
    String login,
    String email,
    Perfil perfil
) {}