package drones.dto.pedidos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PagamentoCartaoRequestDTO(
    @NotBlank(message = "Número do cartão é obrigatório")
    @Pattern(regexp = "^(?:\\d[ -]?){13,19}$", message = "Número do cartão inválido")
    String numeroCartao,
    @NotBlank(message = "Nome do titular é obrigatório")
    String nomeTitular,
    @NotBlank(message = "Data de validade é obrigatória")
    @Pattern(regexp = "^(0[1-9]|1[0-2])/(\\d{2}|\\d{4})$", message = "Data de validade inválida (MM/AA ou MM/AAAA)")
    String dataValidade,
    @NotBlank(message = "Código de segurança é obrigatório")
    @Pattern(regexp = "^\\d{3,4}$", message = "Código de segurança inválido")
    String codigoSeguranca
) {
}
