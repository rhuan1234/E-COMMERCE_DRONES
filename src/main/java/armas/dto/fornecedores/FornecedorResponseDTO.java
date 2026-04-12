package armas.dto.fornecedores;

import java.util.List;

public record FornecedorResponseDTO(
    Long id,
    String nome,
    String cnpj,
    String email,
    Long telefone,
    String endereco,
    List<Long> armasIds,
    boolean ativo,
    Long administradorId
) {

}
