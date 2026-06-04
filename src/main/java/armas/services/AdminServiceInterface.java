package armas.services;

import java.util.List;

import armas.dto.usuarios.AlterarSenhaAdminDTO;
import armas.model.usuario.Usuario;

public interface AdminServiceInterface {
    List<Usuario> buscarTodos();
    Usuario buscarPorId(Long id);
    Usuario buscarPorLogin(String login);
    Usuario criar(Usuario usuario);
    void atualizar(Long id, Usuario usuario);
    void deletar(Long id);
    void alterarSenha(AlterarSenhaAdminDTO dto);
}