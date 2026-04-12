package armas.dto.fornecedores;

public record EnderecoResponseDTO(
    Long id,
    String rua,
    String bairro,
    String cidade,
    String estado,
    String cep,
    Long fornecedorId
) {
}
