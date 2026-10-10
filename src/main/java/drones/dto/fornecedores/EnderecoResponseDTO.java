package drones.dto.fornecedores;

public record EnderecoResponseDTO(
    Long id,
    String rua,
    String bairro,
    CidadeResponseDTO cidade,
    String cep
) {
}
