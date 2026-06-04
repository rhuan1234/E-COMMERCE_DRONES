package armas.dto.fornecedores;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record FornecedorRequestDTO(

     @NotBlank(message = "Nome é obrigatório")
     @Pattern(regexp = "^[\\p{L}0-9\\s._-]{2,100}$", message = "Nome deve conter apenas letras, números, espaços, pontos, underscores e hífens")
     String nome,

     @NotBlank(message = "CNPJ é obrigatório")
     @Pattern(regexp = "^\\d{2}\\.?\\d{3}\\.?\\d{3}/?\\d{4}-?\\d{2}$", message = "CNPJ inválido")
     String cnpj,

     @NotBlank(message = "O email é obrigatório")
     @Pattern(regexp = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", message = "Email inválido")
     String email,

     @Valid
     @NotNull(message = "O telefone é obrigatório")
     TelefoneRequestDTO telefone,

     boolean ativo,

     @Valid
     @NotNull(message = "O endereço é obrigatório")
     EnderecoRequestDTO endereco
) {

}
