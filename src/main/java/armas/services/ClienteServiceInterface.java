package armas.services;

import java.util.List;

import armas.dto.fornecedores.EnderecoRequestClienteDTO;
import armas.dto.fornecedores.EnderecoResponseClienteDTO;
import armas.dto.usuarios.AlterarSenhaClienteDTO;
import armas.dto.usuarios.ClienteRequestCompletoDTO;
import armas.dto.usuarios.ClienteRequestSimplesDTO;
import armas.dto.usuarios.ClienteResponseCompletoDTO;
import armas.dto.usuarios.ResetarSenhaDTO;
import armas.model.usuario.Usuario;

public interface ClienteServiceInterface {
    Usuario criar(ClienteRequestSimplesDTO dto);
    ClienteResponseCompletoDTO atualizar(String login, ClienteRequestCompletoDTO dto);
    ClienteResponseCompletoDTO obterDados(String login);
    void alterarSenha(String login, AlterarSenhaClienteDTO dto);
    void enviarRecuperacao(String email);
    void resetarSenha(ResetarSenhaDTO dto);
    List<EnderecoResponseClienteDTO> listarEnderecos(String login);
    public EnderecoResponseClienteDTO adicionarEndereco(String login, EnderecoRequestClienteDTO dto);
    public void removerEndereco(String login, Long enderecoId);
    public EnderecoResponseClienteDTO editarEndereco(String login, Long enderecoId, EnderecoRequestClienteDTO dto);
    public EnderecoResponseClienteDTO obterEnderecoPrincipal(String login);

}
