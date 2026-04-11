package armas.resources;

import java.util.List;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import armas.services.RiflePrecisaoService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import armas.dto.armas.RiflePrecisaoRequestDTO;
import armas.dto.armas.RiflePrecisaoResponseDTO;
import armas.mapper.RiflePrecisaoMapper;
import armas.model.armas.RiflePrecisao;

@ApplicationScoped
@Path("/rifle-precisao")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RiflePrecisaoController {

    @Inject
    RiflePrecisaoService riflePrecisaoService;

    @POST
    public Response salvar(RiflePrecisaoRequestDTO rifleDTO){
        RiflePrecisao novo = riflePrecisaoService.create(RiflePrecisaoMapper.toEntity(rifleDTO));
        RiflePrecisaoResponseDTO novaDTO = RiflePrecisaoMapper.toResponseDTO(novo);
        return Response.status(Response.Status.CREATED).entity(novaDTO).build();
    }

    @GET
    public Response findAll(){
        List<RiflePrecisaoResponseDTO> rifles = riflePrecisaoService.findAll()
                .stream()
                .map(RiflePrecisaoMapper::toResponseDTO)
                .toList();
        return Response.ok(rifles).build();
    }
    
    @GET
    @Path("/{id}")
    public Response findById(@PathParam("id") Long id){
        RiflePrecisao rifle = riflePrecisaoService.findById(id);
        if (rifle == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        RiflePrecisaoResponseDTO rifleDTO = RiflePrecisaoMapper.toResponseDTO(rifle);
        return Response.ok(rifleDTO).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deletar(@PathParam("id") Long id){
        if (riflePrecisaoService.delete(id)){
            return Response.status(Response.Status.NO_CONTENT).build();
        }
        return Response.status(Response.Status.NOT_FOUND).build();
    }

    @PUT
    @Path("/{id}")
    public Response alterar(@PathParam("id") Long id, RiflePrecisaoRequestDTO dados){
        RiflePrecisao existente = riflePrecisaoService.findById(id);
        if (existente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        RiflePrecisao at = riflePrecisaoService.update(id, RiflePrecisaoMapper.toEntity(dados));
        RiflePrecisaoResponseDTO atualizadoDTO = RiflePrecisaoMapper.toResponseDTO(at);
        return Response.ok(atualizadoDTO).build();
    }
    
}
