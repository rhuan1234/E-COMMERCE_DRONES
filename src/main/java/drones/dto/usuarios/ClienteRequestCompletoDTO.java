package drones.dto.usuarios;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;


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

    @NotBlank(message = "O telefone é obrigatório")
    @Pattern(regexp = "^\\(?\\d{2}\\)?\\s?9?\\d{4}-?\\d{4}$", message = "Número de telefone inválido")
    String telefone
) {

}
