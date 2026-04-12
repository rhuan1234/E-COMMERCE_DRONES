package armas.resources;

import java.util.List;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import armas.dto.administrador.TelefoneRequestDTO;
import armas.dto.administrador.TelefoneResponseDTO;
import armas.mapper.TelefoneMapper;
import armas.model.administrador.Telefone;
import armas.services.TelefoneService;
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
@Path("/telefones")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TelefoneController {
    
    @Inject
    TelefoneService telefoneService;

    @GET
    public Response findAll() {
        List<TelefoneResponseDTO> telefones = telefoneService.findAll()
            .stream()
            .map(e -> TelefoneMapper.toResponseDTO(e))
            .toList();
        return Response.ok(telefones).build();
    }

    @POST
    public Response salvar(TelefoneRequestDTO telefone) {
        Telefone novo = telefoneService.create(TelefoneMapper.toEntity(telefone));
        TelefoneResponseDTO dto = TelefoneMapper.toResponseDTO(novo);
        return Response.status(Response.Status.CREATED).entity(dto).build();
    }

    @GET
    @Path("/{id}")
    public Response findById(@PathParam("id") Long id) {
        TelefoneResponseDTO telefone = TelefoneMapper.toResponseDTO(telefoneService.findById(id));
        return Response.ok(telefone).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, TelefoneRequestDTO telefone) {
        Telefone atualizado = telefoneService.update(id, TelefoneMapper.toEntity(telefone));
        TelefoneResponseDTO dto = TelefoneMapper.toResponseDTO(atualizado);
        return Response.ok(dto).build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        telefoneService.delete(id);
        return Response.noContent().build();
    }
}
