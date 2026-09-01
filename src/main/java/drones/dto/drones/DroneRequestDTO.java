package drones.dto.drones;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record DroneRequestDTO(

     @NotBlank(message = "Nome é obrigatório")
     @Pattern(regexp = "^[\\p{L}\\p{N}\\s._-]{3,100}$", message = "Nome deve conter apenas letras, números, espaços, pontos, underscores e hífens")
     String nome,

     @NotBlank(message = "Marca é obrigatória")
     @Pattern(regexp = "^[\\p{L}\\p{N}\\s._-]{2,50}$", message = "Marca deve conter apenas letras, números, espaços, pontos, underscores e hífens")
     String marca,

     @NotBlank(message = "Modelo é obrigatório")
     @Pattern(regexp = "^[\\p{L}\\p{N}\\s._-]{2,50}$", message = "Modelo deve conter apenas letras, números, espaços, pontos, underscores e hífens")
     String modelo,

     @NotNull(message = "O preço é obrigatório")
     @Positive(message = "O preço deve ser um número positivo")
     Double preco,

     @NotNull(message = "A quantidade disponível é obrigatória")
     @PositiveOrZero(message = "Quantidade disponível deve ser zero ou maior")
     Integer quantidadeDisponivel,

     @NotNull(message = "O status da drone é obrigatório")
     Boolean ativa,

     @NotNull(message = "O tempo de voo prático é obrigatório")
     @PositiveOrZero(message = "O tempo de voo prático deve ser zero ou maior")
     Integer tempoVooPratico,

     @NotNull(message = "O peso de decolagem é obrigatório")
     @Positive(message = "O peso de decolagem deve ser um número positivo")
     Double pesoDecolagem,

     @NotNull(message = "A altitude máxima é obrigatória")
     @Positive(message = "A altitude máxima deve ser um número positivo")
     Integer altitudeMaxima,

     @NotNull(message = "A velocidade máxima é obrigatória")
     @Positive(message = "A velocidade máxima deve ser um número positivo")
     Integer velocidadeMaxima,

     @NotNull(message = "O alcance de transmissão é obrigatório")
     @Positive(message = "O alcance de transmissão deve ser um número positivo")
     Integer alcanceTransmissao,

     @NotNull(message = "O campo possui câmera é obrigatório")
     Boolean possuiCamera,

     @NotNull(message = "A quantidade de motores é obrigatória")
     @PositiveOrZero(message = "Quantidade de motores deve ser zero ou maior")
     Integer quantidadeMotores,

     @NotNull(message = "O campo com controle remoto é obrigatório")
     Boolean comControleRemoto,

     @NotNull(message = "O campo controlado por aplicativo é obrigatório")
     Boolean controladoPorAplicativo,

     @NotNull(message = "A quantidade de baterias é obrigatória")
     @PositiveOrZero(message = "Quantidade de baterias deve ser zero ou maior")
     Integer quantidadeBaterias,

     @NotBlank(message = "A duração da bateria é obrigatória")
     @Pattern(regexp = "^[\\p{L}\\p{N}\\s._-]{2,50}$", message = "Duração da bateria deve conter apenas letras, números, espaços, pontos, underscores e hífens")
     String duracaoBateria,

     @NotBlank(message = "A frequência do Wi-Fi é obrigatória")
     @Pattern(regexp = "^[\\p{L}\\p{N}\\s._-]{2,50}$", message = "Frequência do Wi-Fi deve conter apenas letras, números, espaços, pontos, underscores e hífens")
     String frequenciaWifi,

     @NotNull(message = "O campo possui GPS é obrigatório")
     Boolean possuiGPS,

     @NotNull(message = "O id do fornecedor é obrigatório")
     @Positive(message = "O id do fornecedor deve ser um número positivo")
     Long fornecedorId
) {

}