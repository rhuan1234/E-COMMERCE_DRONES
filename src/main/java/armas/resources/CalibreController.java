package armas.resources;

import java.util.List;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import armas.services.CalibreService;
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
import armas.exception.ValidationException;
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
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public Response salvar(@Valid CalibreRequestDTO calibre){
        if (calibre == null) {
            throw new ValidationException("Dados do calibre são obrigatórios");
        }
        Calibre nova = calibreService.criar(CalibreMapper.toEntity(calibre));
        CalibreResponseDTO novaDTO = CalibreMapper.toResponseDTO(nova);
        return Response.status(Response.Status.CREATED).entity(novaDTO).build();
    }

    @GET
    @Path("/admin")
    @RolesAllowed("ADMIN")
    public Response buscarPorTodos(){
        List<CalibreResponseDTO> calibres = calibreService.buscarTodos()
        .stream()
        .map(e -> CalibreMapper.toResponseDTO(e))
        .toList();
        return Response.ok(calibres).build();
    }


    
    @GET
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response buscarPorId(@PathParam("id") Long id){
        if (id == null || id <= 0) {
            throw new ValidationException("Id do calibre inválido", "id");
        }
        Calibre calibre = calibreService.buscarPorId(id);
        if (calibre == null) {
            throw new NotFoundException("Calibre não encontrado");
        }
        CalibreResponseDTO calibreDTO = CalibreMapper.toResponseDTO(calibre);
        return Response.ok(calibreDTO).build();
    }



    @GET
    @Path("/nomes/admin/{nome}")
    @RolesAllowed("ADMIN")
    public Response buscarPorNome(@PathParam("nome") String nome){
        if (nome == null || nome.isBlank()) {
            throw new ValidationException("Nome do calibre é obrigatório", "nome");
        }
        Calibre calibre = calibreService.buscarPorNome(nome);
        if (calibre == null) {
            throw new NotFoundException("Calibre não encontrado");
        }
        CalibreResponseDTO calibreDTO = CalibreMapper.toResponseDTO(calibre);
        return Response.ok(calibreDTO).build();
    }


    @Transactional
    @DELETE
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response deletar(@PathParam("id") Long id){
        if (id == null || id <= 0) {
            throw new ValidationException("Id do calibre inválido", "id");
        }
        if (calibreService.deletar(id)){
            return Response.status(Response.Status.NO_CONTENT).build();
        }
        throw new NotFoundException("Calibre não encontrado");
    }

    @Transactional
    @PUT
    @Path("/admin/{id}")
    @RolesAllowed("ADMIN")
    public Response alterar(@PathParam("id") Long id, @Valid CalibreRequestDTO dados){
        if (id == null || id <= 0) {
            throw new ValidationException("Id do calibre inválido", "id");
        }
        if (dados == null) {
            throw new ValidationException("Dados do calibre são obrigatórios");
        }
        Calibre atualizada = calibreService.atualizar(id, CalibreMapper.toEntity(dados));
        if (atualizada == null) {
            throw new NotFoundException("Calibre não encontrado");
        }
        CalibreResponseDTO atualizadaDTO = CalibreMapper.toResponseDTO(atualizada);
        return Response.ok(atualizadaDTO).build();
    }
}