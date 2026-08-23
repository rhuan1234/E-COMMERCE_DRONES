package drones.resources;

import java.util.List;

import drones.dto.fornecedores.FornecedorRequestDTO;
import drones.dto.fornecedores.FornecedorResponseDTO;
import drones.exception.ValidationException;
import drones.mapper.FornecedorMapper;
import drones.model.fornecedor.Fornecedor;
import drones.services.FornecedorService;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
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


@ApplicationScoped
@Path("/fornecedores")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FornecedorController {
    @Inject
    FornecedorService fornecedorService;

    @GET
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public Response buscarPorTodos(){
        List<FornecedorResponseDTO> fornecedores = fornecedorService.buscarTodos()
        .stream()
        .map(e -> FornecedorMapper.toResponseDTO(e))
        .toList();
        return Response.ok(fornecedores).build();
    }

    @POST
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public Response salvar(@Valid FornecedorRequestDTO fornecedor){
        if (fornecedor == null) {
            throw new ValidationException("Dados do fornecedor são obrigatórios");
        }
        Fornecedor novo = fornecedorService.criar(FornecedorMapper.toEntity(fornecedor));
        FornecedorResponseDTO dto = FornecedorMapper.toResponseDTO(novo);
        return Response.status(Response.Status.CREATED).entity(dto).build();
    }

    @GET
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response buscarPorId(@PathParam("id") Long id){
        if (id == null || id <= 0) {
            throw new ValidationException("Id do fornecedor inválido", "id");
        }
        Fornecedor fornecedorEntity = fornecedorService.buscarPorId(id);
        if (fornecedorEntity == null) {
            throw new NotFoundException("Fornecedor não encontrado");
        }
        FornecedorResponseDTO fornecedor = FornecedorMapper.toResponseDTO(fornecedorEntity);
        return Response.ok(fornecedor).build();
    }

    @GET
    @Path("/admin/nomes/{nome}")
    @RolesAllowed("ADMIN")
    public Response buscarPorNome(@PathParam("nome") String nome){
        if (nome == null || nome.isBlank()) {
            throw new ValidationException("Nome do fornecedor é obrigatório", "nome");
        }
        Fornecedor fornecedorEntity = fornecedorService.buscarPorNome(nome);
        if (fornecedorEntity == null) {
            throw new NotFoundException("Fornecedor não encontrado");
        }
        FornecedorResponseDTO fornecedor = FornecedorMapper.toResponseDTO(fornecedorEntity);
        return Response.ok(fornecedor).build();
    }

    @Transactional
    @DELETE
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response deletar(@PathParam("id") Long id){
        if (id == null || id <= 0) {
            throw new ValidationException("Id do fornecedor inválido", "id");
        }
        Fornecedor fornecedor = fornecedorService.buscarPorId(id);
        if (fornecedor == null) {
            throw new NotFoundException("Fornecedor não encontrado");
        }
        if(fornecedorService.deletar(id)){
            return Response.status(Response.Status.NO_CONTENT).build();
        }
        return Response.status(Response.Status.CONFLICT).entity("Não é possível excluir o fornecedor pois há drones associados.").build();
    }

    @Transactional
    @PUT
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response alterar(@PathParam("id") Long id, @Valid FornecedorRequestDTO dados){
        if (id == null || id <= 0) {
            throw new ValidationException("Id do fornecedor inválido", "id");
        }
        if (dados == null) {
            throw new ValidationException("Dados do fornecedor são obrigatórios");
        }
        Fornecedor atualizado = fornecedorService.atualizar(id, FornecedorMapper.toEntity(dados));
        if (atualizado == null) {
            throw new NotFoundException("Fornecedor não encontrado");
        }
        FornecedorResponseDTO atualizadoDTO = FornecedorMapper.toResponseDTO(atualizado);
        return Response.ok(atualizadoDTO).build();
    }
}
