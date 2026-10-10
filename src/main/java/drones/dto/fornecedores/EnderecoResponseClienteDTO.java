package drones.dto.fornecedores;

public record EnderecoResponseClienteDTO(
    Long id,
    String rua,
    String bairro,
    CidadeResponseDTO cidade,
    String cep,
    Boolean principal
) {

}
