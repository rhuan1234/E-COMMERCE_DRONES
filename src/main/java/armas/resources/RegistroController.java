package armas.resources;

import java.util.List;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import armas.dto.registro.RegistroRequestDTO;
import armas.dto.registro.RegistroResponseDTO;
import armas.mapper.RegistroMapper;
import armas.model.registro.Registro;
import armas.services.RegistroService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;

import jakarta.ws.rs.GET;

import jakarta.ws.rs.PUT;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@ApplicationScoped
@Path("/registros")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RegistroController {
    @Inject
    RegistroService registroService;

    @GET
    public Response findAll(){
        List<RegistroResponseDTO> registros = registroService.findAll()
        .stream()
        .map(e -> RegistroMapper.toResponseDTO(e))
        .toList();
        return Response.ok(registros).build();
    }

    @GET
    @Path("/{id}")
    public Response findById(@PathParam("id") Long id){
        RegistroResponseDTO registro = RegistroMapper.toResponseDTO(registroService.findById(id)) ;
        return Response.ok(registro).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, RegistroRequestDTO registro){
        Registro atualizado = registroService.update(id, RegistroMapper.toEntity(registro));
        RegistroResponseDTO dto = RegistroMapper.toResponseDTO(atualizado);
        return Response.ok(dto).build();
    }

   
}