package armas.dto.armas;
import java.util.List;

import armas.dto.registro.RegistroResponseDTO;
public record FuzilResponseDTO(

    // 🔹 campos da Arma
    Long id,
    String nome,
    String marca,
    String modelo,
    double preco,
    int quantidadeDisponivel,
    boolean ativa,
    
    List<Long> calibres,
    Long fornecedorId,
    // 🔹 campos da Fuzil
    String modoDisparo,
    double alcanceEfetivo,
    boolean possuiTrilhoTatico,
    RegistroResponseDTO registro,
    String carregadorId,
    List<Long> mirasIds
) {

}