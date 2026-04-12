package armas.mapper;

import armas.dto.fornecedores.FornecedorRequestDTO;
import armas.dto.fornecedores.FornecedorResponseDTO;
import armas.model.fornecedor.Fornecedor;

import armas.repository.TelefoneRepository;

public class FornecedorMapper {
    public static Fornecedor toEntity(FornecedorRequestDTO dto){
        Fornecedor fornecedor = new Fornecedor();


        fornecedor.setNome(dto.nome());
        fornecedor.setEmail(dto.email());
        fornecedor.setEndereco(dto.endereco());
        fornecedor.setCnpj(dto.cnpj());
        TelefoneRepository telefoneRepo = new TelefoneRepository();
        fornecedor.setTelefone(telefoneRepo.findById(dto.telefone()));
        fornecedor.setAtivo(dto.ativo());

        return fornecedor;
    }

    public static FornecedorResponseDTO toResponseDTO(Fornecedor fornecedor){
            return new FornecedorResponseDTO(
                fornecedor.getId(),
    fornecedor.getNome(),
    fornecedor.getCnpj(),
    fornecedor.getEmail(),
    fornecedor.getTelefone() != null ? fornecedor.getTelefone().getId() : null,
    fornecedor.getEndereco(),
    fornecedor.getArmas() != null ? fornecedor.getArmas().stream().map(arma -> arma.getId()).toList() : null,
    fornecedor.isAtivo()
            );
    }
}
