package armas.dto.fornecedores;


public record FornecedorRequestDTO(
     String nome,
     String cnpj,
     String email,
     Long telefone,
     String endereco,
     boolean ativo,
     Long administradorId
) {

}
