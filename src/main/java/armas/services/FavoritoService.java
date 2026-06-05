package armas.services;

import armas.model.armas.Favorito;
import armas.model.armas.Fuzil;
import armas.model.usuario.Usuario;
import armas.repository.FavoritoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response.Status;

import java.util.List;

@ApplicationScoped
public class FavoritoService implements FavoritoServiceInterface {
    @Inject
    FavoritoRepository favoritoRepository;
    @Inject
    FuzilService fuzilService;
    @Inject
    AdminServiceInterface usuarioService;

    @Override
    public void salvar(String login, Long fuzilId) {
        Usuario usuario = buscarUsuario(login);
        Fuzil fuzil = fuzilService.buscarPorId(fuzilId);
        if (fuzil == null) {
            throw new WebApplicationException("Fuzil não encontrado", Status.NOT_FOUND);
        }

        // Verificar se o favorito já existe
        Favorito existente = favoritoRepository.encontrarFavorito(usuario.getId(), fuzilId);
        if (existente != null) {
            throw new WebApplicationException("Este fuzil já está nos favoritos", Status.BAD_REQUEST);
        }

        favoritoRepository.salvar(new Favorito(usuario, fuzil));
    }

    @Override
    public void remover(String login, Long fuzilId) {
        Usuario usuario = buscarUsuario(login);
        Fuzil fuzil = fuzilService.buscarPorId(fuzilId);
        if (fuzil == null) {
            throw new WebApplicationException("Fuzil não encontrado", Status.NOT_FOUND);
        }

        Favorito favorito = favoritoRepository.encontrarFavorito(usuario.getId(), fuzilId);
        if (favorito == null) {
            throw new WebApplicationException("Este fuzil não está nos favoritos", Status.NOT_FOUND);
        }

        favoritoRepository.remover(favorito);
    }

    @Override
    public List<Favorito> listarFavoritos(String login) {
        Usuario usuario = buscarUsuario(login);
        return favoritoRepository.listarPorUsuario(usuario.getId());
    }

    private Usuario buscarUsuario(String login) {
        Usuario usuario = usuarioService.buscarPorLogin(login);
        if (usuario == null) {
            throw new WebApplicationException("Usuário não encontrado", Status.NOT_FOUND);
        }
        return usuario;
    }
}
