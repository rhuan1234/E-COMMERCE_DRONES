package armas.dto.fornecedores;


public record FornecedorRequestDTO(
     String nome,
     String cnpj,
     String email,
     String telefone,
     String endereco,
     boolean ativo,
     Long administradorId
) {

}
