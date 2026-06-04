package armas.mapper;

import armas.dto.fornecedores.FornecedorRequestDTO;
import armas.dto.fornecedores.FornecedorResponseDTO;
import armas.model.fornecedor.Fornecedor;

public class FornecedorMapper {
    public static Fornecedor toEntity(FornecedorRequestDTO dto){
        Fornecedor fornecedor = new Fornecedor();

        fornecedor.setNome(dto.nome());
        fornecedor.setEmail(dto.email());
        
        // Se um EnderecoRequestDTO foi fornecido, usar o EnderecoMapper
        if (dto.endereco() != null) {
            fornecedor.setEndereco(EnderecoMapper.toEntity(dto.endereco()));
        }
        
        // Se um TelefoneRequestDTO foi fornecido, usar o TelefoneMapper
        if (dto.telefone() != null) {
            fornecedor.setTelefone(TelefoneMapper.toEntity(dto.telefone()));
        }
        
        fornecedor.setCnpj(dto.cnpj());
        fornecedor.setAtivo(dto.ativo());

        return fornecedor;
    }

    public static FornecedorResponseDTO toResponseDTO(Fornecedor fornecedor){
            return new FornecedorResponseDTO(
                fornecedor.getId(),
                fornecedor.getNome(),
                fornecedor.getCnpj(),
                fornecedor.getEmail(),
                fornecedor.getTelefone() != null ? TelefoneMapper.toResponseDTO(fornecedor.getTelefone()) : null,
                fornecedor.getFuzis() != null ? fornecedor.getFuzis().stream().map(fuzil -> fuzil.getId()).toList() : null,
                fornecedor.isAtivo(),
                fornecedor.getEndereco() != null ? EnderecoMapper.toResponseDTO(fornecedor.getEndereco()) : null
            );
    }
}