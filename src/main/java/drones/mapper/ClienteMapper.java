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
    usuario.setTelefone(dto.telefone());

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
                usuario.getTelefone(),
                enderecos
        );
    }
}
