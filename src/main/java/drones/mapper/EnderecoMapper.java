package drones.mapper;

import drones.dto.fornecedores.EnderecoRequestClienteDTO;
import drones.dto.fornecedores.EnderecoRequestDTO;
import drones.dto.fornecedores.EnderecoResponseClienteDTO;
import drones.dto.fornecedores.EnderecoResponseDTO;
import drones.model.fornecedor.Endereco;


public class EnderecoMapper {

    public static Endereco toEntity(EnderecoRequestDTO dto) {
        Endereco endereco = new Endereco();
        endereco.setRua(dto.rua());
        endereco.setBairro(dto.bairro());
        endereco.setCidade(dto.cidade());
        endereco.setEstado(dto.estado());
        endereco.setCep(dto.cep());
        endereco.setPrincipal(false);

        return endereco;
    }

    public static EnderecoResponseDTO toResponseDTO(Endereco endereco) {
        return new EnderecoResponseDTO(
            endereco.getId(),
            endereco.getRua(),
            endereco.getBairro(),
            endereco.getCidade(),
            endereco.getEstado(),
            endereco.getCep()
        );
    }
    public static Endereco toEntityEnderecoCliente(EnderecoRequestClienteDTO dto) {
        Endereco endereco = new Endereco();
        endereco.setRua(dto.rua());
        endereco.setBairro(dto.bairro());
        endereco.setCidade(dto.cidade());
        endereco.setEstado(dto.estado());
        endereco.setCep(dto.cep());
        endereco.setPrincipal(dto.principal());
        return endereco;
    }

    public static EnderecoResponseClienteDTO toResponseEnderecoClienteDTO(Endereco endereco) {
        return new EnderecoResponseClienteDTO(
            endereco.getId(),
            endereco.getRua(),
            endereco.getBairro(),
            endereco.getCidade(),
            endereco.getEstado(),
            endereco.getCep(),
            endereco.isPrincipal()
        );
    }
}