package armas.dto.armas;
import java.util.List;
public record FuzilResponseEcommerceDTO(

    // 🔹 campos da Arma
    Long id,
    String nome,
    String marca,
    String modelo,
    double preco,
    int quantidadeDisponivel,
    List<String> calibresNome,
    // 🔹 campos da Fuzil
    String modoDisparo,
    double alcanceEfetivo,
    boolean possuiTrilhoTatico,
    String registroNumeroSerie,
    String carregadorModelo,
    List<String> mirasModelo
) {

}