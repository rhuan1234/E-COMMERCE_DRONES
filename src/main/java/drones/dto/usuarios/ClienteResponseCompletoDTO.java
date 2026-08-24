package drones.dto.usuarios;

import java.util.List;

import drones.dto.fornecedores.EnderecoResponseClienteDTO;


public record ClienteResponseCompletoDTO(
    String login,
    String nomeCompleto,
    String email,
    String cpf,
    String telefone,
    List<EnderecoResponseClienteDTO> enderecos
) {
    
}
