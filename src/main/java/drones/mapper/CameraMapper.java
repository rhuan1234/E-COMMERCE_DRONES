package drones.mapper;

import drones.dto.drones.CameraRequestDTO;
import drones.dto.drones.CameraResponseDTO;
import drones.model.drones.Camera;

public class CameraMapper {

    public static Camera toEntity(CameraRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        Camera camera = new Camera();
        camera.setModelo(dto.modelo());
        camera.setMarca(dto.marca());
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
            camera.getModelo(),
            camera.getMarca(),
            camera.getResolucao(),
            camera.getZoom(),
            camera.isEstabilizacao(),
            camera.getFps()
        );
    }
}
