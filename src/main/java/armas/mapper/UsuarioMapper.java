package armas.mapper;

import armas.dto.usuarios.UsuarioRequestDTO;
import armas.dto.usuarios.UsuarioResponseDTO;
import armas.model.usuario.Usuario;

public class UsuarioMapper {

    public static Usuario toEntity(UsuarioRequestDTO dto) {
        Usuario usuario = new Usuario();
        usuario.setLogin(dto.login());
        usuario.setSenhaHash(dto.senha());
        usuario.setEmail(dto.email());
        usuario.setPerfil(dto.perfil());
        return usuario;
    }

    public static UsuarioResponseDTO toResponseDTO(Usuario usuario) {
        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getLogin(),
                usuario.getEmail(),
                usuario.getPerfil()
        );
    }
}