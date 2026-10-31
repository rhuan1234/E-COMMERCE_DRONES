package drones.mapper;

import drones.dto.fornecedores.EnderecoRequestClienteDTO;
import drones.dto.fornecedores.EnderecoRequestDTO;
import drones.dto.fornecedores.EnderecoResponseClienteDTO;
import drones.dto.fornecedores.EnderecoResponseDTO;
import drones.model.fornecedor.Endereco;
import drones.model.fornecedor.Cidade;
import drones.model.fornecedor.Estado;

public class EnderecoMapper {

    public static Endereco toEntity(EnderecoRequestDTO dto) {

        Endereco endereco = new Endereco();
        endereco.setRua(dto.rua());
        endereco.setBairro(dto.bairro());
        endereco.setCidade(toCidadeEntity(dto.cidade()));
        endereco.setCep(dto.cep());
        endereco.setPrincipal(false);

        return endereco;
    }

    public static EnderecoResponseDTO toResponseDTO(Endereco endereco) {
        return new EnderecoResponseDTO(
            endereco.getId(),
            endereco.getRua(),
            endereco.getBairro(),
            toCidadeResponseDTO(endereco.getCidade()),
            endereco.getCep()
        );
    }
    public static Endereco toEntityEnderecoCliente(EnderecoRequestClienteDTO dto) {
        Endereco endereco = new Endereco();
        endereco.setRua(dto.rua());
        endereco.setBairro(dto.bairro());
        endereco.setCidade(toCidadeEntity(dto.cidade()));
        endereco.setCep(dto.cep());
        endereco.setPrincipal(dto.principal());
        return endereco;
    }

    public static EnderecoResponseClienteDTO toResponseEnderecoClienteDTO(Endereco endereco) {
        return new EnderecoResponseClienteDTO(
            endereco.getId(),
            endereco.getRua(),
            endereco.getBairro(),
            toCidadeResponseDTO(endereco.getCidade()),
            endereco.getCep(),
            endereco.isPrincipal()
        );
    }

    public static Cidade toCidadeEntity(drones.dto.fornecedores.CidadeRequestDTO dto) {
        Cidade cidade = new Cidade();
        cidade.setNome(dto.nome());
        cidade.setEstado(toEntityEstado(dto.estado()));
        return cidade;
    }

    private static drones.dto.fornecedores.CidadeResponseDTO toCidadeResponseDTO(Cidade cidade) {
        if (cidade == null) {
            return null;
        }
        drones.dto.fornecedores.EstadoResponseDTO estado = cidade.getEstado() == null
            ? null
            : new drones.dto.fornecedores.EstadoResponseDTO(
                cidade.getEstado().getId(), cidade.getEstado().getNome());
        return new drones.dto.fornecedores.CidadeResponseDTO(
            cidade.getId(), cidade.getNome(), estado);
    }

    public static Estado toEntityEstado(drones.dto.fornecedores.EstadoRequestDTO dto) {
        Estado estado = new Estado();
        estado.setNome(dto.nome());
        return estado;
    }
}