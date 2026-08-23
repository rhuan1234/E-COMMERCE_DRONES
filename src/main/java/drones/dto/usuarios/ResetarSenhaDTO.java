package drones.dto.usuarios;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ResetarSenhaDTO(

    @NotBlank
    String token,

    @NotBlank
    @Pattern(regexp = ".{6,}", message = "A nova senha deve ter no mínimo 6 caracteres")
    String novaSenha

) {}