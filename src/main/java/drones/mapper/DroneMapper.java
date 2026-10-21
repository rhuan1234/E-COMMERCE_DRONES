package drones.mapper;

import drones.dto.drones.DroneRequestDTO;
import drones.dto.drones.DroneImageResponseDTO;
import drones.dto.drones.DroneResponseDTO;
import drones.dto.drones.DroneResponseEcommerceDTO;
import drones.model.drones.Drone;
import drones.model.drones.DroneImage;
import drones.model.drones.Marca;
import drones.model.drones.Modelo;
import drones.repository.CameraRepository;
import drones.repository.FornecedorRepository;
import drones.repository.MarcaRepository;
import drones.repository.ModeloRepository;
public class DroneMapper {
    public static Drone toEntity(DroneRequestDTO dto){
        
        Drone drone = new Drone();

        drone.setNome(dto.nome());
        if (dto.marcaId() != null) {
            MarcaRepository marcaRepository = new MarcaRepository();
            Marca marca = marcaRepository.findById(dto.marcaId());
            if (marca != null) {
                drone.setMarca(marca);
            } else {
                Marca ref = new Marca();
                ref.setId(dto.marcaId());
                drone.setMarca(ref);
            }
        }
        if (dto.modeloId() != null) {
            ModeloRepository modeloRepository = new ModeloRepository();
            Modelo modelo = modeloRepository.findById(dto.modeloId());
            if (modelo != null) {
                drone.setModelo(modelo);
            } else {
                Modelo ref = new Modelo();
                ref.setId(dto.modeloId());
                drone.setModelo(ref);
            }
        }
        drone.setPreco(dto.preco());
        drone.setQuantidadeDisponivel(dto.quantidadeDisponivel());
        drone.setAtiva(dto.ativa());
        if(dto.cameraId() != null){
            CameraRepository cameraRepository = new CameraRepository();
            if (cameraRepository.findById(dto.cameraId()) != null) {
                drone.setCamera(cameraRepository.findById(dto.cameraId()));
            }
        }
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
        MarcaMapper.toResponseDTO(drone.getMarca()),
        ModeloMapper.toResponseDTO(drone.getModelo()),
        drone.getMarca() != null ? drone.getMarca().getId() : null,
        drone.getModelo() != null ? drone.getModelo().getId() : null,
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
        drone.getFornecedor() != null ? drone.getFornecedor().getId() : null,
        CameraMapper.toResponseDTO(drone.getCamera()),
        drone.getImagens().stream().map(DroneMapper::toImageResponseDTO).toList()
    );
    }

    private static DroneImageResponseDTO toImageResponseDTO(DroneImage imagem) {
        return new DroneImageResponseDTO(
                imagem.getId(),
                "/drones/imagens/" + imagem.getId() + "/arquivo",
                imagem.isPrincipal(),
                imagem.getOrdem());
    }

    public static DroneResponseEcommerceDTO toResponseEcommerceDTO(Drone drone){
        
    return new DroneResponseEcommerceDTO(
        drone.getId(),
        drone.getNome(),
        MarcaMapper.toResponseDTO(drone.getMarca()),
        ModeloMapper.toResponseDTO(drone.getModelo()),
        drone.getMarca() != null ? drone.getMarca().getId() : null,
        drone.getModelo() != null ? drone.getModelo().getId() : null,
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
        CameraMapper.toResponseDTO(drone.getCamera()),
        drone.getImagens().stream().map(DroneMapper::toImageResponseDTO).toList()
    );
    }
}