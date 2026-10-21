package drones.resources;

import java.util.List;

import drones.dto.PageResponse;

import drones.dto.drones.DroneRequestDTO;
import drones.dto.drones.DroneResponseDTO;
import drones.dto.drones.DroneResponseEcommerceDTO;
import drones.exception.ValidationException;
import drones.mapper.DroneMapper;
import drones.model.drones.Drone;
import drones.model.drones.DroneImage;
import drones.services.DroneImageStorageService;
import drones.services.DroneService;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.StreamingOutput;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.nio.file.Files;

@ApplicationScoped
@Path("/drones")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DroneController {

    @Inject
    DroneService droneService;
    @Inject
    DroneImageStorageService droneImageStorageService;

    @POST
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public Response salvar(@Valid DroneRequestDTO drone){
        if (drone == null) {
            throw new ValidationException("Dados do drone são obrigatórios");
        }
        Drone nova = droneService.criar(DroneMapper.toEntity(drone));
        DroneResponseDTO novaDTO = DroneMapper.toResponseDTO(nova);
        return Response.status(Response.Status.CREATED).entity(novaDTO).build();
    }

    @POST
    @Path("/admin/{id}/imagens")
    @RolesAllowed("ADMIN")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response adicionarImagem(
            @PathParam("id") Long id,
            @RestForm("arquivo") FileUpload arquivo,
            @RestForm("principal") boolean principal,
            @RestForm("ordem") int ordem) {
        if (ordem < 0) {
            throw new ValidationException("A ordem da imagem deve ser zero ou maior", "ordem");
        }
        var caminhoArquivo = droneImageStorageService.salvar(arquivo);
        DroneImage novaImagem = new DroneImage();
        novaImagem.setCaminho(caminhoArquivo.getFileName().toString());
        novaImagem.setPrincipal(principal);
        novaImagem.setOrdem(ordem);

        Drone droneAtualizado;
        try {
            droneAtualizado = droneService.adicionarImagem(id, novaImagem);
        } catch (RuntimeException e) {
            try {
                droneImageStorageService.deletar(novaImagem.getCaminho());
            } catch (RuntimeException cleanupFailure) {
                e.addSuppressed(cleanupFailure);
            }
            throw e;
        }
        return Response.status(Response.Status.CREATED)
                .entity(DroneMapper.toResponseDTO(droneAtualizado))
                .build();
    }

    @DELETE
    @Path("/admin/{droneId}/imagens/{imagemId}")
    @RolesAllowed("ADMIN")
    public Response deletarImagem(
            @PathParam("droneId") Long droneId,
            @PathParam("imagemId") Long imagemId) {
        droneService.deletarImagem(droneId, imagemId);
        return Response.noContent().build();
    }

    @GET
    @Path("/imagens/{imagemId}/arquivo")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response buscarArquivoImagem(@PathParam("imagemId") Long imagemId) {
        DroneImage imagem = droneService.buscarImagem(imagemId);
        var arquivo = droneImageStorageService.buscar(imagem.getCaminho());
        StreamingOutput conteudo = output -> Files.copy(arquivo, output);
        return Response.ok(conteudo)
                .type(droneImageStorageService.obterTipoConteudo(imagem.getCaminho()))
                .header("Content-Disposition", "inline")
                .build();
    }

    @GET
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public PageResponse<DroneResponseDTO> buscarPorTodos(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("pageSize") @DefaultValue("10") int pageSize,
            @QueryParam("nome") String nome,
            @QueryParam("marca") String marca,
            @QueryParam("modelo") String modelo,
            @QueryParam("min") Double precoMin,
            @QueryParam("max") Double precoMax){
        List<Drone> drones = droneService.buscarComFiltros(page, pageSize, nome, marca, modelo, precoMin, precoMax);
        long totalItems = droneService.countComFiltros(nome, marca, modelo, precoMin, precoMax);
        return PageResponse.of(drones, page, pageSize, totalItems, DroneMapper::toResponseDTO);
    }

    @GET
    public PageResponse<DroneResponseEcommerceDTO> buscarPorTodosEcommerce(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("pageSize") @DefaultValue("10") int pageSize,
            @QueryParam("nome") String nome,
            @QueryParam("marca") String marca,
            @QueryParam("modelo") String modelo,
            @QueryParam("min") Double precoMin,
            @QueryParam("max") Double precoMax){
        List<Drone> drones = droneService.buscarComFiltros(page, pageSize, nome, marca, modelo, precoMin, precoMax);
        long totalItems = droneService.countComFiltros(nome, marca, modelo, precoMin, precoMax);
        return PageResponse.of(drones, page, pageSize, totalItems, DroneMapper::toResponseEcommerceDTO);
    }

    @GET
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response buscarPorId(@PathParam("id") Long id){
        if (id == null || id <= 0) {
            throw new ValidationException("Id do drone é inválido", "id");
        }
        Drone droneEntity = droneService.buscarPorId(id);
        if (droneEntity == null) {
            throw new NotFoundException("Drone não encontrado");
        }
        DroneResponseDTO drone = DroneMapper.toResponseDTO(droneEntity);
        return Response.ok(drone).build();
    }

    @GET
    @Path("/{id}")
    public Response buscarPorIdEcommerce(@PathParam("id") Long id){
        if (id == null || id <= 0) {
            throw new ValidationException("Id do drone é inválido", "id");
        }
        Drone droneEntity = droneService.buscarPorId(id);
        if (droneEntity == null) {
            throw new NotFoundException("Drone não encontrado");
        }
        DroneResponseEcommerceDTO drone = DroneMapper.toResponseEcommerceDTO(droneEntity);
        return Response.ok(drone).build();
    }

    @GET
    @Path("/admin/nomes/{nome}")
    @RolesAllowed("ADMIN")
    public Response buscarPorNome(@PathParam("nome") String nome){
        if (nome == null || nome.isBlank()) {
            throw new ValidationException("Nome do drone é obrigatório", "nome");
        }
        Drone droneEntity = droneService.buscarPorNome(nome);
        if (droneEntity == null) {
            throw new NotFoundException("Drone não encontrado");
        }
        DroneResponseDTO drone = DroneMapper.toResponseDTO(droneEntity);
        return Response.ok(drone).build();
    }

    @GET
    @Path("/nome/{nome}")
    public Response buscarPorNomeEcommerce(@PathParam("nome") String nome){
        if (nome == null || nome.isBlank()) {
            throw new ValidationException("Nome do drone é obrigatório", "nome");
        }
        Drone droneEntity = droneService.buscarPorNome(nome);
        if (droneEntity == null) {
            throw new NotFoundException("Drone não encontrado");
        }
        DroneResponseEcommerceDTO drone = DroneMapper.toResponseEcommerceDTO(droneEntity);
        return Response.ok(drone).build();
    }

    @GET
    @Path("/marcas/{marca}")
    public PageResponse<DroneResponseEcommerceDTO> buscarPorMarcaEcommerce(@QueryParam("page") @DefaultValue("0") int page,
                                    @QueryParam("pageSize") @DefaultValue("10") int pageSize, @PathParam("marca") String marca){
        if (marca == null || marca.isBlank()) {
            throw new ValidationException("Marca do drone é obrigatória", "marca");
        }
        List<Drone> drones = droneService.buscarPorMarca(page, pageSize, marca);
        long totalItems = droneService.countMarcas(marca);
        return PageResponse.of(drones, page, pageSize, totalItems, DroneMapper::toResponseEcommerceDTO);
    }

    @GET
    @Path("/modelos/{modelo}")
    public PageResponse<DroneResponseEcommerceDTO> buscarPorModeloEcommerce(@QueryParam("page") @DefaultValue("0") int page,
                                    @QueryParam("pageSize") @DefaultValue("10") int pageSize,@PathParam("modelo") String modelo){
        if (modelo == null || modelo.isBlank()) {
            throw new ValidationException("Modelo do drone é obrigatório", "modelo");
        }
        List<Drone> drones = droneService.buscarPorModelo(page, pageSize, modelo);
        long totalItems = droneService.countModelos(modelo);
        return PageResponse.of(drones, page, pageSize, totalItems, DroneMapper::toResponseEcommerceDTO);
    }

    @GET
    @Path("/preco/")
    public PageResponse<DroneResponseEcommerceDTO> buscarPorPrecoEcommerce(@QueryParam("page") @DefaultValue("0") int page,
                                    @QueryParam("pageSize") @DefaultValue("10") int pageSize, @QueryParam("min") Double precoMin, @QueryParam("max") Double precoMax){
        if (precoMin == null || precoMax == null) {
            throw new ValidationException("Preço mínimo e máximo são obrigatórios", "precoMin/precoMax");
        }
        List<Drone> drones = droneService.buscarPorPreco(page, pageSize, precoMin, precoMax);
        long totalItems = droneService.countPreco(precoMin, precoMax);
        return PageResponse.of(drones, page, pageSize, totalItems, DroneMapper::toResponseEcommerceDTO);
    }

    @Transactional
    @DELETE
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response deletar(@PathParam("id") Long id){
        if (id == null) {
            throw new ValidationException("Id do drone é obrigatório", "id");
        }
        Drone drone = droneService.buscarPorId(id);
        if (drone == null) {
            throw new NotFoundException("Drone não encontrado");
        }
        if (droneService.deletar(id)){
            return Response.status(Response.Status.NO_CONTENT).build();
        }
        throw new ValidationException("Não foi possível excluir o drone", "id");
    }

    @Transactional
    @PUT
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response alterar(@PathParam("id") Long id, @Valid DroneRequestDTO dados){
        if (id == null) {
            throw new ValidationException("Id do drone é obrigatório", "id");
        }
        if (dados == null) {
            throw new ValidationException("Dados do drone são obrigatórios");
        }
        Drone atualizada = droneService.atualizar(id, DroneMapper.toEntity(dados));
        if (atualizada == null) {
            throw new NotFoundException("Drone não encontrado");
        }
        DroneResponseDTO atualizadaDTO = DroneMapper.toResponseDTO(atualizada);
        return Response.ok(atualizadaDTO).build();
    }
    
}