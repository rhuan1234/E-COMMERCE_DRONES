package drones.resources;

import java.util.List;

import drones.dto.drones.CameraRequestDTO;
import drones.dto.drones.CameraResponseDTO;
import drones.exception.ValidationException;
import drones.mapper.CameraMapper;
import drones.model.drones.Camera;
import drones.services.CameraService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@ApplicationScoped
@Path("/cameras")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CameraController {

    @Inject
    CameraService cameraService;

    @POST
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public Response salvar(@Valid CameraRequestDTO dados) {
        if (dados == null) {
            throw new ValidationException("Dados da câmera são obrigatórios");
        }
        Camera camera = cameraService.criar(CameraMapper.toEntity(dados));
        return Response.status(Response.Status.CREATED)
            .entity(CameraMapper.toResponseDTO(camera))
            .build();
    }

    @GET
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public Response buscarTodos() {
        List<CameraResponseDTO> cameras = cameraService.buscarTodos().stream()
            .map(CameraMapper::toResponseDTO)
            .toList();
        return Response.ok(cameras).build();
    }

    @GET
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response buscarPorId(@PathParam("id") Long id) {
        Camera camera = cameraService.buscarPorId(id);
        if (camera == null) {
            throw new NotFoundException("Câmera não encontrada");
        }
        return Response.ok(CameraMapper.toResponseDTO(camera)).build();
    }

    @PUT
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    @Transactional
    public Response alterar(@PathParam("id") Long id, @Valid CameraRequestDTO dados) {
        if (dados == null) {
            throw new ValidationException("Dados da câmera são obrigatórios");
        }
        Camera camera = cameraService.atualizar(id, CameraMapper.toEntity(dados));
        if (camera == null) {
            throw new NotFoundException("Câmera não encontrada");
        }
        return Response.ok(CameraMapper.toResponseDTO(camera)).build();
    }

    @DELETE
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    @Transactional
    public Response deletar(@PathParam("id") Long id) {
        cameraService.buscarPorId(id);
        if (cameraService.deletar(id)) {
            return Response.status(Response.Status.NO_CONTENT).build();
        }
        return Response.status(Response.Status.CONFLICT)
            .entity("Não é possível excluir a câmera pois há drones associados.")
            .build();
    }
}