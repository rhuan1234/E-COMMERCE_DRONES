package armas.dto.administrador;

import java.util.List;

public record AdministradorRequestDTO(

    String nome,
    String email,
    String telefone,
    String cpf,
    String senha
) {
    
}