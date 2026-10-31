package drones.dto.fornecedores;

import java.util.List;

public record FornecedorResponseDTO(
    Long id,
    String nome,
    String cnpj,
    String email,
    String telefone,
    List<Long> droneIds,
    boolean ativo,
    EnderecoResponseDTO endereco
) {

}
