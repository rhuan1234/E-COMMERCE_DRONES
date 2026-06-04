package armas.dto.fornecedores;

public record EnderecoResponseClienteDTO(
    Long id,
    String rua,
    String bairro,
    String cidade,
    String estado,
    String cep,
    Boolean principal
) {

}
