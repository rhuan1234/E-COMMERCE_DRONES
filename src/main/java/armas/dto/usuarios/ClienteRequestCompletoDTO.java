package armas.dto.usuarios;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import armas.dto.fornecedores.TelefoneRequestDTO;
import io.smallrye.common.constraint.NotNull;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ClienteRequestCompletoDTO(

    @NotBlank(message = "O nome completo é obrigatório")
    @Pattern(regexp = "^[\\p{L}\\s.'-]{2,100}$", message = "Nome completo inválido")
    String nomeCompleto,

    @NotBlank(message = "O CPF é obrigatório")
    @Pattern(regexp = "^\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}$", message = "CPF inválido")
    String cpf,

    @Valid
    @NotNull
    TelefoneRequestDTO numero,

    @NotBlank(message = "O registro de atirador é obrigatório")
    String registroAtirador
) {

}
