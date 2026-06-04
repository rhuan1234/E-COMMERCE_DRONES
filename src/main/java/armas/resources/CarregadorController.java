package armas.resources;

import java.util.List;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import armas.services.CarregadorService;
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
import armas.exception.ValidationException;
import armas.dto.armas.CarregadorRequestDTO;
import armas.dto.armas.CarregadorResponseDTO;
import armas.mapper.CarregadorMapper;
import armas.model.armas.Carregador;

@ApplicationScoped
@Path("/carregadores")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CarregadorController {

    @Inject
    CarregadorService carregadorService;

    @POST
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public Response salvar(@Valid CarregadorRequestDTO carregador) {
        if (carregador == null) {
            throw new ValidationException("Dados do carregador são obrigatórios");
        }
        Carregador novo = carregadorService.criar(CarregadorMapper.toEntity(carregador));
        CarregadorResponseDTO novoDTO = CarregadorMapper.toResponseDTO(novo);
        return Response.status(Response.Status.CREATED).entity(novoDTO).build();
    }

    @GET
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public Response findAll() {
        List<CarregadorResponseDTO> carregadores = carregadorService.buscarTodos()
            .stream()
            .map(e -> CarregadorMapper.toResponseDTO(e))
            .toList();
        return Response.ok(carregadores).build();
    }


    @GET
    @RolesAllowed("ADMIN")
    @Path("/admin/{id}")
    public Response findById(@PathParam("id") Long id) {
        if (id == null || id <= 0) {
            throw new ValidationException("Id do carregador inválido", "id");
        }
        Carregador entity = carregadorService.buscarPorId(id);
        if (entity == null) {
            throw new NotFoundException("Carregador não encontrado");
        }
        CarregadorResponseDTO carregador = CarregadorMapper.toResponseDTO(entity);
        return Response.ok(carregador).build();
    }


    @GET
    @RolesAllowed("ADMIN")
    @Path("/modelos/admin/{modelo}")
    public Response findByModelo(@PathParam("modelo") String modelo) {
        if (modelo == null || modelo.isBlank()) {
            throw new ValidationException("Modelo do carregador é obrigatório", "modelo");
        }
        Carregador entity = carregadorService.buscarPorModelo(modelo);
        if (entity == null) {
            throw new NotFoundException("Carregador não encontrado");
        }
        CarregadorResponseDTO carregador = CarregadorMapper.toResponseDTO(entity);
        return Response.ok(carregador).build();
    }



    

    @Transactional
    @DELETE
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response deletar(@PathParam("id") Long id) {
        if (id == null || id <= 0) {
            throw new ValidationException("Id do carregador inválido", "id");
        }
        if (carregadorService.deletar(id)) {
            return Response.status(Response.Status.NO_CONTENT).build();
        }
        throw new NotFoundException("Carregador não encontrado");
    }

    @Transactional
    @PUT
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response alterar(@PathParam("id") Long id, @Valid CarregadorRequestDTO dados) {
        if (id == null || id <= 0) {
            throw new ValidationException("Id do carregador inválido", "id");
        }
        if (dados == null) {
            throw new ValidationException("Dados do carregador são obrigatórios");
        }
        Carregador atualizado = carregadorService.atualizar(id, CarregadorMapper.toEntity(dados));
        if (atualizado == null) {
            throw new NotFoundException("Carregador não encontrado");
        }
        CarregadorResponseDTO atualizadoDTO = CarregadorMapper.toResponseDTO(atualizado);
        return Response.ok(atualizadoDTO).build();
    }
}
