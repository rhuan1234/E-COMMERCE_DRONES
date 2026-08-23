package drones.services;

import java.util.List;

import drones.dto.fornecedores.EnderecoRequestClienteDTO;
import drones.dto.fornecedores.EnderecoResponseClienteDTO;
import drones.dto.usuarios.AlterarSenhaClienteDTO;
import drones.dto.usuarios.ClienteRequestCompletoDTO;
import drones.dto.usuarios.ClienteRequestSimplesDTO;
import drones.dto.usuarios.ClienteResponseCompletoDTO;
import drones.dto.usuarios.ResetarSenhaDTO;
import drones.model.usuario.Usuario;

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
