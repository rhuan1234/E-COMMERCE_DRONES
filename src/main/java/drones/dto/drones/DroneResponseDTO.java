package drones.dto.drones;

import java.util.List;

public record DroneResponseDTO(
    Long id,
    String nome,
    MarcaResponseDTO marca,
    ModeloResponseDTO modelo,
    Long marcaId,
    Long modeloId,
    double preco,
    int quantidadeDisponivel,
    boolean ativa,
    int tempoVooPratico,
    double pesoDecolagem,
    int altitudeMaxima,
    int velocidadeMaxima,
    int alcanceTransmissao,
    boolean possuiCamera,
    int quantidadeMotores,
    boolean comControleRemoto,
    boolean controladoPorAplicativo,
    int quantidadeBaterias,
    String duracaoBateria,
    String frequenciaWifi,
    boolean possuiGPS,
    Long fornecedorId,
    CameraResponseDTO camera,
    List<DroneImageResponseDTO> imagens

) {

}