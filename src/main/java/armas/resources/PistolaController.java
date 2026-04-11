package armas.resources;

import java.util.List;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import armas.services.PistolaService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import armas.dto.armas.PistolaRequestDTO;
import armas.dto.armas.PistolaResponseDTO;
import armas.mapper.PistolaMapper;
import armas.model.armas.Pistola;

@ApplicationScoped
@Path("/pistolas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PistolaController {

    @Inject
    PistolaService pistolaService;

    @POST
    public Response salvar(PistolaRequestDTO pistola){
        Pistola nova = pistolaService.create(PistolaMapper.toEntity(pistola));
        PistolaResponseDTO novaDTO = PistolaMapper.toResponseDTO(nova);
        return Response.status(Response.Status.CREATED).entity(novaDTO).build();
    }

    @GET
    public Response findAll(){
        List<PistolaResponseDTO> pistolas = pistolaService.findAll()
        .stream()
        .map(e -> PistolaMapper.toResponseDTO(e))
        .toList();
        return Response.ok(pistolas).build();
    }
    
    @GET
    @Path("/{id}")
    public Response findById(@PathParam("id") Long id){
        PistolaResponseDTO pistola = PistolaMapper.toResponseDTO(pistolaService.findById(id));
        return Response.ok(pistola).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deletar(@PathParam("id") Long id){
        if (pistolaService.delete(id)){
            return Response.status(Response.Status.NO_CONTENT).build();
        }
    return Response.status(Response.Status.NOT_FOUND).build();
    }

    @PUT
    @Path("/{id}")
    public Response alterar(@PathParam("id") Long id, PistolaRequestDTO dados){
        Pistola atualizada = pistolaService.update(id, PistolaMapper.toEntity(dados));
        PistolaResponseDTO atualizadaDTO = PistolaMapper.toResponseDTO(atualizada);
        return Response.ok(atualizadaDTO).build();
    }
    
}
