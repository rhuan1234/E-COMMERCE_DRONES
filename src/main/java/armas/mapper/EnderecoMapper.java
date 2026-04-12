package armas.mapper;

import armas.dto.fornecedores.EnderecoRequestDTO;
import armas.dto.fornecedores.EnderecoResponseDTO;
import armas.model.fornecedor.Endereco;
import armas.model.fornecedor.Fornecedor;
import armas.repository.FornecedorRepository;

public class EnderecoMapper {

    public static Endereco toEntity(EnderecoRequestDTO dto) {
        Endereco endereco = new Endereco();
        endereco.setRua(dto.rua());
        endereco.setBairro(dto.bairro());
        endereco.setCidade(dto.cidade());
        endereco.setEstado(dto.estado());
        endereco.setCep(dto.cep());

        // if (dto.fornecedorId() != null) {
        //     FornecedorRepository fornecedorRepository = new FornecedorRepository();
        //     Fornecedor fornecedor = fornecedorRepository.findById(dto.fornecedorId());
        //     endereco.setFornecedor(fornecedor);
        // }

        return endereco;
    }

    public static EnderecoResponseDTO toResponseDTO(Endereco endereco) {
        return new EnderecoResponseDTO(
            endereco.getId(),
            endereco.getRua(),
            endereco.getBairro(),
            endereco.getCidade(),
            endereco.getEstado(),
            endereco.getCep(),
            endereco.getFornecedor() != null ? endereco.getFornecedor().getId() : null
        );
    }
}
