package armas.dto.fornecedores;

import java.util.List;

public record FornecedorResponseDTO(
    Long id,
    String nome,
    String cnpj,
    String email,
    TelefoneResponseDTO telefone,
    List<Long> fuzisIds,
    boolean ativo,
    EnderecoResponseDTO endereco
) {

}
