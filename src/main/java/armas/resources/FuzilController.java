package armas.resources;

import java.util.List;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import armas.services.FuzilService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import armas.dto.armas.FuzilRequestDTO;
import armas.dto.armas.FuzilResponseDTO;
import armas.mapper.FuzilMapper;
import armas.model.armas.Fuzil;

@ApplicationScoped
@Path("/fuzis")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FuzilController {

    @Inject
    FuzilService fuzilService;

    @POST
    public Response salvar(FuzilRequestDTO fuzil){
        Fuzil nova = fuzilService.create(FuzilMapper.toEntity(fuzil));
        FuzilResponseDTO novaDTO = FuzilMapper.toResponseDTO(nova);
        return Response.status(Response.Status.CREATED).entity(novaDTO).build();
    }

    @GET
    public Response findAll(){
        List<FuzilResponseDTO> fuzis = fuzilService.findAll()
        .stream()
        .map(e -> FuzilMapper.toResponseDTO(e))
        .toList();
        return Response.ok(fuzis).build();
    }
    
    @GET
    @Path("/{id}")
    public Response findById(@PathParam("id") Long id){
        FuzilResponseDTO fuzil = FuzilMapper.toResponseDTO(fuzilService.findById(id));
        return Response.ok(fuzil).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deletar(@PathParam("id") Long id){
        if (fuzilService.delete(id)){
            return Response.status(Response.Status.NO_CONTENT).build();
        }
    return Response.status(Response.Status.NOT_FOUND).build();
    }

    @PUT
    @Path("/{id}")
    public Response alterar(@PathParam("id") Long id, FuzilRequestDTO dados){
        Fuzil atualizada = fuzilService.update(id, FuzilMapper.toEntity(dados));
        FuzilResponseDTO atualizadaDTO = FuzilMapper.toResponseDTO(atualizada);
        return Response.ok(atualizadaDTO).build();
    }
    
}