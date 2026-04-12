package armas.resources;

import java.util.List;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import armas.dto.fornecedores.FornecedorRequestDTO;
import armas.dto.fornecedores.FornecedorResponseDTO;
import armas.mapper.FornecedorMapper;
import armas.model.fornecedor.Fornecedor;
import armas.services.FornecedorService;
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
@Path("/fornecedores")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FornecedorController {
    @Inject
    FornecedorService fornecedorService;

    @GET
    public Response findAll(){
        List<FornecedorResponseDTO> fornecedores = fornecedorService.findAll()
        .stream()
        .map(e -> FornecedorMapper.toResponseDTO(e))
        .toList();
        return Response.ok(fornecedores).build();
    }

    @POST
    public Response salvar(FornecedorRequestDTO fornecedor){
        Fornecedor novo = fornecedorService.create(FornecedorMapper.toEntity(fornecedor));
        FornecedorResponseDTO dto = FornecedorMapper.toResponseDTO(novo);
        return Response.status(Response.Status.CREATED).entity(dto).build();
    }

    @GET
    @Path("/{id}")
    public Response findById(@PathParam("id") Long id){
        FornecedorResponseDTO fornecedor = FornecedorMapper.toResponseDTO(fornecedorService.findById(id)) ;
        return Response.ok(fornecedor).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deletar(@PathParam("id") Long id){
        if(fornecedorService.delete(id)){
            return Response.status(Response.Status.NO_CONTENT).build();
        }
        return Response.status(Response.Status.NOT_FOUND).build();
    }

    @PUT
    @Path("/{id}")
    public Response alterar(@PathParam("id") Long id, FornecedorRequestDTO dados){
        Fornecedor atualizado = fornecedorService.update(id, FornecedorMapper.toEntity(dados));
        FornecedorResponseDTO atualizadoDTO = FornecedorMapper.toResponseDTO(atualizado);
        return Response.ok(atualizadoDTO).build();
    }
}
