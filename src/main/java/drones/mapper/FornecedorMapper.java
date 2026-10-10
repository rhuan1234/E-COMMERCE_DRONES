package drones.mapper;

import drones.dto.fornecedores.FornecedorRequestDTO;
import drones.dto.fornecedores.FornecedorResponseDTO;
import drones.model.fornecedor.Fornecedor;

public class FornecedorMapper {
    public static Fornecedor toEntity(FornecedorRequestDTO dto){
        Fornecedor fornecedor = new Fornecedor();

        fornecedor.setNome(dto.nome());
        fornecedor.setEmail(dto.email());
        
        // Se um EnderecoRequestDTO foi fornecido, usar o EnderecoMapper
        if (dto.endereco() != null) {
            fornecedor.setEndereco(EnderecoMapper.toEntity(dto.endereco()));
        }
        
        fornecedor.setTelefone(dto.telefone());
        
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
                fornecedor.getTelefone(),
                fornecedor.getDrones() != null ? fornecedor.getDrones().stream().map(drone -> drone.getId()).toList() : null,
                fornecedor.isAtivo(),
                fornecedor.getEndereco() != null ? EnderecoMapper.toResponseDTO(fornecedor.getEndereco()) : null
            );
    }
}