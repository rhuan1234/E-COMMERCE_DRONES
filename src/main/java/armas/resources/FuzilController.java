package armas.resources;

import java.util.List;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import armas.exception.ValidationException;
import armas.services.FuzilService;
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
import armas.dto.armas.FuzilRequestDTO;
import armas.dto.armas.FuzilResponseDTO;
import armas.dto.armas.FuzilResponseEcommerceDTO;
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
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public Response salvar(@Valid FuzilRequestDTO fuzil){
        if (fuzil == null) {
            throw new ValidationException("Dados do fuzil são obrigatórios");
        }
        Fuzil nova = fuzilService.criar(FuzilMapper.toEntity(fuzil));
        FuzilResponseDTO novaDTO = FuzilMapper.toResponseDTO(nova);
        return Response.status(Response.Status.CREATED).entity(novaDTO).build();
    }

    @GET
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public Response buscarPorTodos(){
        List<FuzilResponseDTO> fuzis = fuzilService.buscarTodos()
        .stream()
        .map(e -> FuzilMapper.toResponseDTO(e))
        .toList();
        return Response.ok(fuzis).build();
    }

    @GET
    public Response buscarPorTodosEcommerce(){
        List<FuzilResponseEcommerceDTO> fuzis = fuzilService.buscarTodos()
        .stream()
        .map(e -> FuzilMapper.toResponseEcommerceDTO(e))
        .toList();
        return Response.ok(fuzis).build();
    }
    
    @GET
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response buscarPorId(@PathParam("id") Long id){
        if (id == null || id <= 0) {
            throw new ValidationException("Id do fuzil é inválido", "id");
        }
        Fuzil fuzilEntity = fuzilService.buscarPorId(id);
        if (fuzilEntity == null) {
            throw new NotFoundException("Fuzil não encontrado");
        }
        FuzilResponseDTO fuzil = FuzilMapper.toResponseDTO(fuzilEntity);
        return Response.ok(fuzil).build();
    }

    @GET
    @Path("/{id}")
    public Response buscarPorIdEcommerce(@PathParam("id") Long id){
        if (id == null || id <= 0) {
            throw new ValidationException("Id do fuzil é inválido", "id");
        }
        Fuzil fuzilEntity = fuzilService.buscarPorId(id);
        if (fuzilEntity == null) {
            throw new NotFoundException("Fuzil não encontrado");
        }
        FuzilResponseEcommerceDTO fuzil = FuzilMapper.toResponseEcommerceDTO(fuzilEntity);
        return Response.ok(fuzil).build();
    }

    @GET
    @Path("/admin/nomes/{nome}")
    @RolesAllowed("ADMIN")
    public Response buscarPorNome(@PathParam("nome") String nome){
        if (nome == null || nome.isBlank()) {
            throw new ValidationException("Nome do fuzil é obrigatório", "nome");
        }
        Fuzil fuzilEntity = fuzilService.buscarPorNome(nome);
        if (fuzilEntity == null) {
            throw new NotFoundException("Fuzil não encontrado");
        }
        FuzilResponseDTO fuzil = FuzilMapper.toResponseDTO(fuzilEntity);
        return Response.ok(fuzil).build();
    }

    @GET
    @Path("/nome/{nome}")
    public Response buscarPorNomeEcommerce(@PathParam("nome") String nome){
        if (nome == null || nome.isBlank()) {
            throw new ValidationException("Nome do fuzil é obrigatório", "nome");
        }
        Fuzil fuzilEntity = fuzilService.buscarPorNome(nome);
        if (fuzilEntity == null) {
            throw new NotFoundException("Fuzil não encontrado");
        }
        FuzilResponseEcommerceDTO fuzil = FuzilMapper.toResponseEcommerceDTO(fuzilEntity);
        return Response.ok(fuzil).build();
    }

    @GET
    @Path("/marcas/{marca}")
    public Response buscarPorMarcaEcommerce(@PathParam("marca") String marca){
        if (marca == null || marca.isBlank()) {
            throw new ValidationException("Marca do fuzil é obrigatória", "marca");
        }
        List<Fuzil> fuzis = fuzilService.buscarPorMarca(marca);
        List<FuzilResponseEcommerceDTO> fuzisDTO = fuzis.stream()
            .map(FuzilMapper::toResponseEcommerceDTO)
            .toList();
        return Response.ok(fuzisDTO).build();
    }

    @GET
    @Path("/modelos/{modelo}")
    public Response buscarPorModeloEcommerce(@PathParam("modelo") String modelo){
        if (modelo == null || modelo.isBlank()) {
            throw new ValidationException("Modelo do fuzil é obrigatório", "modelo");
        }
        List<Fuzil> fuzis = fuzilService.buscarPorModelo(modelo);
        List<FuzilResponseEcommerceDTO> fuzisDTO = fuzis.stream()
            .map(FuzilMapper::toResponseEcommerceDTO)
            .toList();
        return Response.ok(fuzisDTO).build();
    }

    @GET
    @Path("/preco/")
    public Response buscarPorPrecoEcommerce(@QueryParam("min") Double precoMin, @QueryParam("max") Double precoMax){
        if (precoMin == null || precoMax == null) {
            throw new ValidationException("Preço mínimo e máximo são obrigatórios", "precoMin/precoMax");
        }
        List<Fuzil> fuzis = fuzilService.buscarPorPreco(precoMin, precoMax);
        List<FuzilResponseEcommerceDTO> fuzisDTO = fuzis.stream()
            .map(FuzilMapper::toResponseEcommerceDTO)
            .toList();
        return Response.ok(fuzisDTO).build();
    }

    @Transactional
    @DELETE
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response deletar(@PathParam("id") Long id){
        if (id == null) {
            throw new ValidationException("Id do fuzil é obrigatório", "id");
        }
        Fuzil fuzil = fuzilService.buscarPorId(id);
        if (fuzil == null) {
            throw new NotFoundException("Fuzil não encontrado");
        }
        if (fuzilService.deletar(id)){
            return Response.status(Response.Status.NO_CONTENT).build();
        }
        throw new ValidationException("Não foi possível excluir o fuzil", "id");
    }

    @Transactional
    @PUT
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response alterar(@PathParam("id") Long id, @Valid FuzilRequestDTO dados){
        if (id == null) {
            throw new ValidationException("Id do fuzil é obrigatório", "id");
        }
        if (dados == null) {
            throw new ValidationException("Dados do fuzil são obrigatórios");
        }
        Fuzil atualizada = fuzilService.atualizar(id, FuzilMapper.toEntity(dados));
        if (atualizada == null) {
            throw new NotFoundException("Fuzil não encontrado");
        }
        FuzilResponseDTO atualizadaDTO = FuzilMapper.toResponseDTO(atualizada);
        return Response.ok(atualizadaDTO).build();
    }
    
}