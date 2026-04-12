package armas.dto.fornecedores;


public record FornecedorRequestDTO(
     String nome,
     String cnpj,
     String email,
     Long telefone,
     Long enderecoId,
     boolean ativo
) {

}
