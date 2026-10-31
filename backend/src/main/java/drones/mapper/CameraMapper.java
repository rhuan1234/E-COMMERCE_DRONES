package drones.mapper;

import drones.dto.drones.CameraRequestDTO;
import drones.dto.drones.CameraResponseDTO;
import drones.model.drones.Camera;
import drones.model.drones.Marca;
import drones.model.drones.Modelo;
import drones.repository.MarcaRepository;
import drones.repository.ModeloRepository;

public class CameraMapper {

    public static Camera toEntity(CameraRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        Camera camera = new Camera();
        if (dto.modeloId() != null) {
            ModeloRepository modeloRepository = new ModeloRepository();
            Modelo modelo = modeloRepository.findById(dto.modeloId());
            if (modelo != null) {
                camera.setModelo(modelo);
            } else {
                Modelo ref = new Modelo();
                ref.setId(dto.modeloId());
                camera.setModelo(ref);
            }
        }
        if (dto.marcaId() != null) {
            MarcaRepository marcaRepository = new MarcaRepository();
            Marca marca = marcaRepository.findById(dto.marcaId());
            if (marca != null) {
                camera.setMarca(marca);
            } else {
                Marca ref = new Marca();
                ref.setId(dto.marcaId());
                camera.setMarca(ref);
            }
        }
        camera.setResolucao(dto.resolucao());
        camera.setZoom(dto.zoom());
        camera.setEstabilizacao(dto.estabilizacao());
        camera.setFps(dto.fps());
        return camera;
    }

    public static CameraResponseDTO toResponseDTO(Camera camera) {
        if (camera == null) {
            return null;
        }

        return new CameraResponseDTO(
            camera.getId(),
            ModeloMapper.toResponseDTO(camera.getModelo()),
            MarcaMapper.toResponseDTO(camera.getMarca()),
            camera.getModelo() != null ? camera.getModelo().getId() : null,
            camera.getMarca() != null ? camera.getMarca().getId() : null,
            camera.getResolucao(),
            camera.getZoom(),
            camera.isEstabilizacao(),
            camera.getFps()
        );
    }
}
