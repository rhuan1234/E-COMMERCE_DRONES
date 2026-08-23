package drones.dto.fornecedores;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record EnderecoRequestClienteDTO(

    @NotBlank(message = "A rua é obrigatória")
    @Pattern(regexp = "^[\\p{L}0-9\\s.,º°#/-]{2,100}$", message = "Rua inválida")
    String rua,

    @NotBlank(message = "O bairro é obrigatório")
    @Pattern(regexp = "^[\\p{L}0-9\\s.,/-]{2,80}$", message = "Bairro inválido")
    String bairro,

    @NotBlank(message = "A cidade é obrigatória")
    @Pattern(regexp = "^[\\p{L}\\s.'-]{2,80}$", message = "Cidade inválida")
    String cidade,

    @NotBlank(message = "O estado é obrigatório")
    @Pattern(regexp = "^[A-Za-z]{2}$", message = "Estado deve ser a sigla da UF (2 letras)")
    String estado,

    @NotBlank(message = "O CEP é obrigatório")
    @Pattern(regexp = "^\\d{5}-?\\d{3}$", message = "CEP inválido")
    String cep,

    @NotNull(message = "É obrigatório informar se o endereço é o principal")
    Boolean principal
) {

}
