package drones.dto.usuarios;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AlterarSenhaAdminDTO (

    @NotBlank
    String login,

    @NotBlank
    @Pattern(regexp = ".{6,}", message = "A senha atual deve ter no mínimo 6 caracteres")
    String senhaAtual,

    @NotBlank
    @Pattern(regexp = ".{6,}", message = "A nova senha deve ter no mínimo 6 caracteres")
    String novaSenha
){

}
