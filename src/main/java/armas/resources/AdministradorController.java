package armas.resources;

import java.util.List;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import armas.dto.administrador.AdministradorRequestDTO;
import armas.dto.administrador.AdministradorResponseDTO;
import armas.mapper.AdministradorMapper;
import armas.model.administrador.Administrador;
import armas.services.AdministradorService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;


@ApplicationScoped
@Path("/administradores")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AdministradorController {
    @Inject
    AdministradorService usuarioService;

    @GET
    public Response findAll(){
        List<AdministradorResponseDTO> administradores = usuarioService.findAll()
        .stream()
        .map(e -> AdministradorMapper.toResponseDTO(e))
        .toList();
        return Response.ok(administradores).build();
    }

    @POST
    public Response salvar(AdministradorRequestDTO administrador){
        Administrador novo = usuarioService.create(AdministradorMapper.toEntity(administrador));
        AdministradorResponseDTO dto = AdministradorMapper.toResponseDTO(novo);
        return Response.status(Response.Status.CREATED).entity(dto).build();
    }

    @GET
    @Path("/{id}")
    public Response findById(@PathParam("id") Long id){
        AdministradorResponseDTO administrador = AdministradorMapper.toResponseDTO(usuarioService.findById(id)) ;
        return Response.ok(administrador).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deletar(@PathParam("id") Long id){
        if(usuarioService.delete(id)){
            return Response.status(Response.Status.NO_CONTENT).build();
        }
        return Response.status(Response.Status.NOT_FOUND).build();
    }

    @PUT
    @Path("/{id}")
    public Response alterar(@PathParam("id") Long id, AdministradorRequestDTO dados){
        Administrador atualizado = usuarioService.update(id, AdministradorMapper.toEntity(dados));
        AdministradorResponseDTO atualizadoDTO = AdministradorMapper.toResponseDTO(atualizado);
        return Response.ok(atualizadoDTO).build();
    }
}