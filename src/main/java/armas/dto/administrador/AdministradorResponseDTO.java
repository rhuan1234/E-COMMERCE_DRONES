package armas.dto.administrador;

import java.util.List;

public record AdministradorResponseDTO(

    Long id,
    String nome,
    String email,
    String telefone,
    String cpf
    // List<String> telefonesId
) {

}