package drones.dto.drones;

public record DroneResponseDTO(
    Long id,
    String nome,
    String marca,
    String modelo,
    double preco,
    int quantidadeDisponivel,
    boolean ativa,
    int tempoVooPratico,
    double pesoDecolagem,
    int altitudeMaxima,
    int velocidadeMaxima,
    int alcanceTransmissao,
    boolean possuiCamera,
    Long fornecedorId

) {

}