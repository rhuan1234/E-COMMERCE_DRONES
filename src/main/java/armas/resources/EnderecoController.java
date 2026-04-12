package armas.resources;

import java.util.List;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import armas.dto.fornecedores.EnderecoRequestDTO;
import armas.dto.fornecedores.EnderecoResponseDTO;
import armas.mapper.EnderecoMapper;
import armas.model.fornecedor.Endereco;
import armas.services.EnderecoService;
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
@Path("/enderecos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EnderecoController {

    @Inject
    EnderecoService enderecoService;

    @GET
    public Response findAll() {
        List<EnderecoResponseDTO> enderecos = enderecoService.findAll()
            .stream()
            .map(EnderecoMapper::toResponseDTO)
            .toList();
        return Response.ok(enderecos).build();
    }

    @POST
    public Response salvar(EnderecoRequestDTO enderecoDTO) {
        Endereco novo = enderecoService.create(EnderecoMapper.toEntity(enderecoDTO));
        EnderecoResponseDTO dto = EnderecoMapper.toResponseDTO(novo);
        return Response.status(Response.Status.CREATED).entity(dto).build();
    }

    @GET
    @Path("/{id}")
    public Response findById(@PathParam("id") Long id) {
        Endereco endereco = enderecoService.findById(id);
        return Response.ok(EnderecoMapper.toResponseDTO(endereco)).build();
    }

    @PUT
    @Path("/{id}")
    public Response alterar(@PathParam("id") Long id, EnderecoRequestDTO dados) {
        Endereco atualizado = enderecoService.update(id, EnderecoMapper.toEntity(dados));
        return Response.ok(EnderecoMapper.toResponseDTO(atualizado)).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deletar(@PathParam("id") Long id) {
        if (enderecoService.delete(id)) {
            return Response.noContent().build();
        }
        return Response.status(Response.Status.NOT_FOUND).build();
    }
}
