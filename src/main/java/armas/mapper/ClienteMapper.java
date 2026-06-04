package armas.mapper;

import java.util.List;
import java.util.stream.Collectors;

import armas.dto.usuarios.ClienteRequestCompletoDTO;
import armas.dto.usuarios.ClienteRequestSimplesDTO;
import armas.dto.usuarios.ClienteResponseCompletoDTO;
import armas.dto.fornecedores.EnderecoResponseClienteDTO;
import armas.model.usuario.Usuario;

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
    usuario.setRegistroAtirador(dto.registroAtirador());

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
                enderecos,
                usuario.getRegistroAtirador()
        );
    }
}
