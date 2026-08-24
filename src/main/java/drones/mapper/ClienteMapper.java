package drones.mapper;

import java.util.List;
import java.util.stream.Collectors;

import drones.dto.fornecedores.EnderecoResponseClienteDTO;
import drones.dto.usuarios.ClienteRequestCompletoDTO;
import drones.dto.usuarios.ClienteRequestSimplesDTO;
import drones.dto.usuarios.ClienteResponseCompletoDTO;
import drones.model.usuario.Usuario;

public class ClienteMapper {
    public static Usuario toEntitySimples(ClienteRequestSimplesDTO dto) {
        Usuario usuario = new Usuario();
        usuario.setLogin(dto.login());
        usuario.setSenhaHash(dto.senha());
        usuario.setEmail(dto.email());
        return usuario;
    }

    public static Usuario updateEntityCompleto(Usuario usuario, ClienteRequestCompletoDTO dto) {

    usuario.setNomeCompleto(dto.nomeCompleto());
    usuario.setCpf(dto.cpf());
    if(usuario.getTelefone() == null) {
        usuario.setTelefone(TelefoneMapper.toEntity(dto.numero()));
    } else {
        usuario.getTelefone().setNumero(TelefoneMapper.toEntity(dto.numero()).getNumero());
    }
    usuario.setTelefone(TelefoneMapper.toEntity(dto.numero()));

    return usuario;
}

    public static ClienteResponseCompletoDTO toResponseCompletoDTO(Usuario usuario) {
        List<EnderecoResponseClienteDTO> enderecos = usuario.getEnderecos() != null
            ? usuario.getEnderecos()
                .stream()
                .map(EnderecoMapper::toResponseEnderecoClienteDTO)
                .collect(Collectors.toList())
            : List.of();
        
        return new ClienteResponseCompletoDTO(
                usuario.getLogin(),
                usuario.getNomeCompleto(),
                usuario.getEmail(),
                usuario.getCpf(),
                usuario.getTelefone() != null ? usuario.getTelefone().getNumero() : null,
                enderecos
        );
    }
}
