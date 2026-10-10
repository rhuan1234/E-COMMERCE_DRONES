package drones.dto.fornecedores;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

@JsonIgnoreProperties(ignoreUnknown = true)
public record EnderecoRequestDTO(

    @NotBlank(message = "A rua é obrigatória")
    @Pattern(regexp = "^[\\p{L}0-9\\s.,º°#/-]{2,100}$", message = "Rua inválida")
    String rua,

    @NotBlank(message = "O bairro é obrigatório")
    @Pattern(regexp = "^[\\p{L}0-9\\s.,/-]{2,80}$", message = "Bairro inválido")
    String bairro,

    @Valid
    @NotNull(message = "A cidade é obrigatória")
    CidadeRequestDTO cidade,

    @NotBlank(message = "O CEP é obrigatório")
    @Pattern(regexp = "^\\d{5}-?\\d{3}$", message = "CEP inválido")
    String cep

) {
}
