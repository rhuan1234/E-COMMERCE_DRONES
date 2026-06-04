package armas.dto.usuarios;

import armas.model.usuario.Perfil;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UsuarioRequestDTO(

    @NotBlank(message = "O login é obrigatório")
    @Size(min = 3, max = 50, message = "O login deve conter entre 3 e 50 caracteres")
    String login,

    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 6, message = "A senha deve conter no mínimo 6 caracteres")
    String senha,

    @NotBlank(message = "O email é obrigatório")
    @Pattern(regexp = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", message = "Email inválido")
    String email,

    @NotNull(message = "O perfil é obrigatório")
    Perfil perfil
) {}