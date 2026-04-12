package armas.resources;

import java.util.List;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import armas.services.CalibreService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import armas.dto.armas.CalibreRequestDTO;
import armas.dto.armas.CalibreResponseDTO;
import armas.mapper.CalibreMapper;
import armas.model.armas.Calibre;

@ApplicationScoped
@Path("/calibres")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CalibreController {

    @Inject
    CalibreService calibreService;

    @POST
    public Response salvar(CalibreRequestDTO calibre){
        Calibre nova = calibreService.create(CalibreMapper.toEntity(calibre));
        CalibreResponseDTO novaDTO = CalibreMapper.toResponseDTO(nova);
        return Response.status(Response.Status.CREATED).entity(novaDTO).build();
    }

    @GET
    public Response findAll(){
        List<CalibreResponseDTO> calibres = calibreService.findAll()
        .stream()
        .map(e -> CalibreMapper.toResponseDTO(e))
        .toList();
        return Response.ok(calibres).build();
    }
    
    @GET
    @Path("/{id}")
    public Response findById(@PathParam("id") Long id){
        CalibreResponseDTO calibre = CalibreMapper.toResponseDTO(calibreService.findById(id));
        return Response.ok(calibre).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deletar(@PathParam("id") Long id){
        if (calibreService.delete(id)){
            return Response.status(Response.Status.NO_CONTENT).build();
        }
    return Response.status(Response.Status.NOT_FOUND).build();
    }

    @PUT
    @Path("/{id}")
    public Response alterar(@PathParam("id") Long id, CalibreRequestDTO dados){
        Calibre atualizada = calibreService.update(id, CalibreMapper.toEntity(dados));
        CalibreResponseDTO atualizadaDTO = CalibreMapper.toResponseDTO(atualizada);
        return Response.ok(atualizadaDTO).build();
    }
}