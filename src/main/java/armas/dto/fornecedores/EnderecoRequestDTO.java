package armas.dto.fornecedores;

public record EnderecoRequestDTO(
    String rua,
    String bairro,
    String cidade,
    String estado,
    String cep
    // Long fornecedorId
) {
}
