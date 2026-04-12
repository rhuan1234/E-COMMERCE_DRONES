package armas.dto.fornecedores;

import java.util.List;

public record FornecedorResponseDTO(
    Long id,
    String nome,
    String cnpj,
    String email,
    Long telefone,
    Long enderecoId,
    List<Long> armasIds,
    boolean ativo
) {

}
