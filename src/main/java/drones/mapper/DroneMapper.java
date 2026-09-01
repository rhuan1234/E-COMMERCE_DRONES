package drones.mapper;

import drones.dto.drones.DroneRequestDTO;
import drones.dto.drones.DroneResponseDTO;
import drones.dto.drones.DroneResponseEcommerceDTO;
import drones.model.drones.Drone;
import drones.repository.FornecedorRepository;


public class DroneMapper {
    public static Drone toEntity(DroneRequestDTO dto){
        
        Drone drone = new Drone();

        drone.setNome(dto.nome());
        drone.setMarca(dto.marca());
        drone.setModelo(dto.modelo());
        drone.setPreco(dto.preco());
        drone.setQuantidadeDisponivel(dto.quantidadeDisponivel());
        drone.setAtiva(dto.ativa());
        if(dto.fornecedorId() != null){
            FornecedorRepository fornecedorRepository = new FornecedorRepository();
            if (fornecedorRepository.findById(dto.fornecedorId()) != null) {
                drone.setFornecedor(fornecedorRepository.findById(dto.fornecedorId()));
            }
        }
        drone.setTempoVooPratico(dto.tempoVooPratico());
        drone.setPesoDecolagem(dto.pesoDecolagem());
        drone.setAltitudeMaxima(dto.altitudeMaxima());
        drone.setVelocidadeMaxima(dto.velocidadeMaxima());
        drone.setAlcanceTransmissao(dto.alcanceTransmissao());
        drone.setPossuiCamera(dto.possuiCamera());
        drone.setQuantidadeMotores(dto.quantidadeMotores());
        drone.setComControleRemoto(dto.comControleRemoto());
        drone.setControladoPorAplicativo(dto.controladoPorAplicativo());
        drone.setQuantidadeBaterias(dto.quantidadeBaterias());
        drone.setDuracaoBateria(dto.duracaoBateria());
        drone.setFrequenciaWifi(dto.frequenciaWifi());
        drone.setPossuiGPS(dto.possuiGPS());

        return drone;
    }

    public static DroneResponseDTO toResponseDTO(Drone drone){
        
    return new DroneResponseDTO(
        drone.getId(),
        drone.getNome(),
        drone.getMarca(),
        drone.getModelo(),
        drone.getPreco(),
        drone.getQuantidadeDisponivel(),
        drone.isAtiva(),
        drone.getTempoVooPratico(),
        drone.getPesoDecolagem(),
        drone.getAltitudeMaxima(),
        drone.getVelocidadeMaxima(),
        drone.getAlcanceTransmissao(),
        drone.isPossuiCamera(),
        drone.getQuantidadeMotores(),
        drone.isComControleRemoto(),
        drone.isControladoPorAplicativo(),
        drone.getQuantidadeBaterias(),
        drone.getDuracaoBateria(),
        drone.getFrequenciaWifi(),
        drone.isPossuiGPS(),
        drone.getFornecedor() != null ? drone.getFornecedor().getId() : null
    );
    }
    public static DroneResponseEcommerceDTO toResponseEcommerceDTO(Drone drone){
        
    return new DroneResponseEcommerceDTO(
        drone.getId(),
        drone.getNome(),
        drone.getMarca(),
        drone.getModelo(),
        drone.getPreco(),
        drone.getQuantidadeDisponivel(),
        drone.isAtiva(),
        drone.getTempoVooPratico(),
        drone.getPesoDecolagem(),
        drone.getAltitudeMaxima(),
        drone.getVelocidadeMaxima(),
        drone.getAlcanceTransmissao(),
        drone.isPossuiCamera(),
        drone.getQuantidadeMotores(),
        drone.isComControleRemoto(),
        drone.isControladoPorAplicativo(),
        drone.getQuantidadeBaterias(),
        drone.getDuracaoBateria(),
        drone.getFrequenciaWifi(),
        drone.isPossuiGPS()
    );
    }
}