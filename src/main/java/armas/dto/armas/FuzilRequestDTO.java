package armas.dto.armas;
import java.util.List;

import armas.dto.registro.RegistroRequestDTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record FuzilRequestDTO(

    // 🔹 campos da Arma
     @NotBlank(message = "Nome é obrigatório")
     @Pattern(regexp = "^[\\p{L}0-9\\s._-]{3,100}$", message = "Nome deve conter apenas letras, números, espaços, pontos, underscores e hífens")
     String nome,
     @NotBlank(message = "Marca é obrigatória")
     @Pattern(regexp = "^[\\p{L}0-9\\s._-]{2,50}$", message = "Marca deve conter apenas letras, números, espaços, pontos, underscores e hífens")
     String marca,
     @NotBlank(message = "Modelo é obrigatório")
     @Pattern(regexp = "^[\\p{L}0-9\\s._-]{2,50}$", message = "Modelo deve conter apenas letras, números, espaços, pontos, underscores e hífens")
     String modelo,
     @Positive(message = "O preço deve ser um número positivo")
     double preco,
     @PositiveOrZero(message = "Quantidade disponível deve ser zero ou maior")
     int quantidadeDisponivel,
     boolean ativa,
     List<Long> calibres,
     @Positive(message = "O id do fornecedor deve ser um número positivo")
    Long fornecedorId,
     @NotBlank(message = "O modo de disparo é obrigatório")
     @Pattern(regexp = "^(?i)(Semiautomatico|Rajada|Automatico)$", message = "Modo de disparo inválido. Valores válidos: Semiautomatico, Rajada ou Automatico")
     String modoDisparo,
     double alcanceEfetivo,
     boolean possuiTrilhoTatico,
     RegistroRequestDTO registro,
     @Positive(message = "O id do carregador deve ser um número positivo")
     Long carregadorId,
     List<Long> mirasIds
) {
    
}