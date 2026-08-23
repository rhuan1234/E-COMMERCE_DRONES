package drones.services;

import java.util.List;

import drones.dto.usuarios.AlterarSenhaAdminDTO;
import drones.model.usuario.Usuario;

public interface AdminServiceInterface {
    List<Usuario> buscarTodos();
    Usuario buscarPorId(Long id);
    Usuario buscarPorLogin(String login);
    Usuario criar(Usuario usuario);
    void deletar(Long id);
    void alterarSenha(AlterarSenhaAdminDTO dto);
}