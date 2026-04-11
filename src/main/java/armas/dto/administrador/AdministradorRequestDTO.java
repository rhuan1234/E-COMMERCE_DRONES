package armas.dto.administrador;

public record AdministradorRequestDTO(

    String nome,
    String email,
    String telefone,
    String cpf,
    String senha
) {
    
}