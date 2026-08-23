package drones.resources;

import java.util.List;

import drones.dto.drones.DroneRequestDTO;
import drones.dto.drones.DroneResponseDTO;
import drones.dto.drones.DroneResponseEcommerceDTO;
import drones.exception.ValidationException;
import drones.mapper.DroneMapper;
import drones.model.drones.Drone;
import drones.services.DroneService;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@ApplicationScoped
@Path("/drones")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DroneController {

    @Inject
    DroneService droneService;

    @POST
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public Response salvar(@Valid DroneRequestDTO drone){
        if (drone == null) {
            throw new ValidationException("Dados do drone são obrigatórios");
        }
        Drone nova = droneService.criar(DroneMapper.toEntity(drone));
        DroneResponseDTO novaDTO = DroneMapper.toResponseDTO(nova);
        return Response.status(Response.Status.CREATED).entity(novaDTO).build();
    }

    @GET
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public Response buscarPorTodos(){
        List<DroneResponseDTO> drones = droneService.buscarTodos()
        .stream()
        .map(e -> DroneMapper.toResponseDTO(e))
        .toList();
        return Response.ok(drones).build();
    }

    @GET
    public Response buscarPorTodosEcommerce(){
        List<DroneResponseEcommerceDTO> drones = droneService.buscarTodos()
        .stream()
        .map(e -> DroneMapper.toResponseEcommerceDTO(e))
        .toList();
        return Response.ok(drones).build();
    }
    
    @GET
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response buscarPorId(@PathParam("id") Long id){
        if (id == null || id <= 0) {
            throw new ValidationException("Id do drone é inválido", "id");
        }
        Drone droneEntity = droneService.buscarPorId(id);
        if (droneEntity == null) {
            throw new NotFoundException("Drone não encontrado");
        }
        DroneResponseDTO drone = DroneMapper.toResponseDTO(droneEntity);
        return Response.ok(drone).build();
    }

    @GET
    @Path("/{id}")
    public Response buscarPorIdEcommerce(@PathParam("id") Long id){
        if (id == null || id <= 0) {
            throw new ValidationException("Id do drone é inválido", "id");
        }
        Drone droneEntity = droneService.buscarPorId(id);
        if (droneEntity == null) {
            throw new NotFoundException("Drone não encontrado");
        }
        DroneResponseEcommerceDTO drone = DroneMapper.toResponseEcommerceDTO(droneEntity);
        return Response.ok(drone).build();
    }

    @GET
    @Path("/admin/nomes/{nome}")
    @RolesAllowed("ADMIN")
    public Response buscarPorNome(@PathParam("nome") String nome){
        if (nome == null || nome.isBlank()) {
            throw new ValidationException("Nome do drone é obrigatório", "nome");
        }
        Drone droneEntity = droneService.buscarPorNome(nome);
        if (droneEntity == null) {
            throw new NotFoundException("Drone não encontrado");
        }
        DroneResponseDTO drone = DroneMapper.toResponseDTO(droneEntity);
        return Response.ok(drone).build();
    }

    @GET
    @Path("/nome/{nome}")
    public Response buscarPorNomeEcommerce(@PathParam("nome") String nome){
        if (nome == null || nome.isBlank()) {
            throw new ValidationException("Nome do drone é obrigatório", "nome");
        }
        Drone droneEntity = droneService.buscarPorNome(nome);
        if (droneEntity == null) {
            throw new NotFoundException("Drone não encontrado");
        }
        DroneResponseEcommerceDTO drone = DroneMapper.toResponseEcommerceDTO(droneEntity);
        return Response.ok(drone).build();
    }

    @GET
    @Path("/marcas/{marca}")
    public Response buscarPorMarcaEcommerce(@PathParam("marca") String marca){
        if (marca == null || marca.isBlank()) {
            throw new ValidationException("Marca do drone é obrigatória", "marca");
        }
        List<Drone> drones = droneService.buscarPorMarca(marca);
        List<DroneResponseEcommerceDTO> dronesDTO = drones.stream()
            .map(DroneMapper::toResponseEcommerceDTO)
            .toList();
        return Response.ok(dronesDTO).build();
    }

    @GET
    @Path("/modelos/{modelo}")
    public Response buscarPorModeloEcommerce(@PathParam("modelo") String modelo){
        if (modelo == null || modelo.isBlank()) {
            throw new ValidationException("Modelo do drone é obrigatório", "modelo");
        }
        List<Drone> drones = droneService.buscarPorModelo(modelo);
        List<DroneResponseEcommerceDTO> dronesDTO = drones.stream()
            .map(DroneMapper::toResponseEcommerceDTO)
            .toList();
        return Response.ok(dronesDTO).build();
    }

    @GET
    @Path("/preco/")
    public Response buscarPorPrecoEcommerce(@QueryParam("min") Double precoMin, @QueryParam("max") Double precoMax){
        if (precoMin == null || precoMax == null) {
            throw new ValidationException("Preço mínimo e máximo são obrigatórios", "precoMin/precoMax");
        }
        List<Drone> drones = droneService.buscarPorPreco(precoMin, precoMax);
        List<DroneResponseEcommerceDTO> dronesDTO = drones.stream()
            .map(DroneMapper::toResponseEcommerceDTO)
            .toList();
        return Response.ok(dronesDTO).build();
    }

    @Transactional
    @DELETE
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response deletar(@PathParam("id") Long id){
        if (id == null) {
            throw new ValidationException("Id do drone é obrigatório", "id");
        }
        Drone drone = droneService.buscarPorId(id);
        if (drone == null) {
            throw new NotFoundException("Drone não encontrado");
        }
        if (droneService.deletar(id)){
            return Response.status(Response.Status.NO_CONTENT).build();
        }
        throw new ValidationException("Não foi possível excluir o drone", "id");
    }

    @Transactional
    @PUT
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response alterar(@PathParam("id") Long id, @Valid DroneRequestDTO dados){
        if (id == null) {
            throw new ValidationException("Id do drone é obrigatório", "id");
        }
        if (dados == null) {
            throw new ValidationException("Dados do drone são obrigatórios");
        }
        Drone atualizada = droneService.atualizar(id, DroneMapper.toEntity(dados));
        if (atualizada == null) {
            throw new NotFoundException("Drone não encontrado");
        }
        DroneResponseDTO atualizadaDTO = DroneMapper.toResponseDTO(atualizada);
        return Response.ok(atualizadaDTO).build();
    }
    
}