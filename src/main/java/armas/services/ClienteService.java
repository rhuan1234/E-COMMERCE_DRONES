package armas.services;

import java.time.LocalDateTime;
import java.util.List;


import org.eclipse.microprofile.jwt.JsonWebToken;

import armas.dto.fornecedores.EnderecoRequestClienteDTO;
import armas.dto.fornecedores.EnderecoResponseClienteDTO;

import armas.dto.usuarios.AlterarSenhaClienteDTO;
import armas.dto.usuarios.ClienteRequestCompletoDTO;
import armas.dto.usuarios.ClienteRequestSimplesDTO;
import armas.dto.usuarios.ClienteResponseCompletoDTO;
import armas.dto.usuarios.ResetarSenhaDTO;
import armas.exception.ValidationException;
import armas.mapper.ClienteMapper;
import armas.mapper.EnderecoMapper;
import armas.model.fornecedor.Endereco;
import armas.model.usuario.TokenResetarSenha;
import armas.model.usuario.Perfil;
import armas.model.usuario.Usuario;
import armas.repository.EnderecoRepository;
import armas.repository.UsuarioRepository;
import armas.repository.tokenRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class ClienteService implements ClienteServiceInterface {
    
    @Inject
    AdminServiceInterface usuarioService;

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    HashService hashService;

    @Inject
    tokenRepository tokenRepository;

    @Inject
    JsonWebToken jwt;

    @Inject
    EmailService emailService;

    @Inject
    EnderecoRepository enderecoRepository;

    @Override
    @Transactional
    public Usuario criar(ClienteRequestSimplesDTO dto) {
        Usuario usuario = ClienteMapper.toEntitySimples(dto);
        usuario.setPerfil(Perfil.CLIENTE);
        return usuarioService.criar(usuario);
    }

    @Override
    @Transactional
    public ClienteResponseCompletoDTO atualizar(String login, ClienteRequestCompletoDTO dto) {
        if (login == null || login.isBlank()) {
            throw new ValidationException("Usuário não autenticado");
        }

        Usuario cliente = usuarioService.buscarPorLogin(login);
        if (cliente == null) {
            throw new ValidationException("Usuário não encontrado");
        }

        cliente = ClienteMapper.updateEntityCompleto(cliente, dto);
        
        ClienteResponseCompletoDTO response = ClienteMapper.toResponseCompletoDTO(cliente);
        return response;
    }
    @Override
    public ClienteResponseCompletoDTO obterDados(String login) {
        if (login == null || login.isBlank()) {
            throw new ValidationException("Usuário não autenticado");
        }

        Usuario cliente = usuarioRepository.findByLogin(login)
        .orElseThrow(()-> new RuntimeException("Usuário não encontrado"));

        return ClienteMapper.toResponseCompletoDTO(cliente);
        
        
    }

    @Override
    @Transactional
    public void alterarSenha(String login, AlterarSenhaClienteDTO dto) {
        if (login == null || login.isBlank()) {
            throw new ValidationException("Usuário não autenticado");
        }
        if (dto == null) {
            throw new ValidationException("Dados de alteração de senha inválidos");
        }
        if (dto.senhaAtual() == null || dto.senhaAtual().isBlank()) {
            throw new ValidationException("Senha atual não pode estar vazia");
        }
        if (dto.novaSenha() == null || dto.novaSenha().isBlank()) {
            throw new ValidationException("Nova senha não pode estar vazia");
        }

        Usuario cliente = usuarioService.buscarPorLogin(login);
        if (cliente == null) {
            throw new ValidationException("Usuário não encontrado");
        }

        

        // Verifica se a senha atual está correta
        if (!hashService.verificarBcrypt(dto.senhaAtual(), cliente.getSenhaHash())) {
            throw new ValidationException("Senha atual está incorreta");
        }

        // Gera o hash da nova senha com BCrypt
        cliente.setSenhaHash(hashService.bcrypt(dto.novaSenha()));
        usuarioRepository.persist(cliente);
    }

    @Override
    @Transactional
    public void enviarRecuperacao( String email) {
        
        if (email == null || email.isBlank()) {
            throw new ValidationException("Email não informado");
        }

        Usuario usuario = usuarioRepository.findByEmail(email);

        if (usuario == null) {
            throw new ValidationException("Email não encontrado");
        }

        String token = GerarToken.gerarToken();

        TokenResetarSenha reset = new TokenResetarSenha();
        reset.setToken(token);
        reset.setUsuario(usuario);
        reset.setUsado(false);
        reset.setExpiracao(LocalDateTime.now().plusMinutes(30));

        tokenRepository.persist(reset);
        emailService.enviarEmailRecuperacao(usuario.getEmail(), token);
    }

    @Override
    @Transactional
    public void resetarSenha(ResetarSenhaDTO dto) {
        if (dto == null) {
            throw new ValidationException("Dados de redefinição de senha inválidos");
        }
        if (dto.token() == null || dto.token().isBlank()) {
            throw new ValidationException("Token de redefinição não informado");
        }
        if (dto.novaSenha() == null || dto.novaSenha().isBlank()) {
            throw new ValidationException("Nova senha não pode estar vazia");
        }

        TokenResetarSenha reset = tokenRepository.findByToken(dto.token());
        if (reset == null) {
            throw new ValidationException("Token inválido");
        }

        if (reset.isUsado()) {
            throw new ValidationException("Token já utilizado");
        }

        if (reset.getExpiracao().isBefore(LocalDateTime.now())) {
            throw new ValidationException("Token expirado");
        }

        Usuario usuario = reset.getUsuario();
        usuario.setSenhaHash(hashService.bcrypt(dto.novaSenha()));
        reset.setUsado(true);
    }

    @Override
    public List<EnderecoResponseClienteDTO> listarEnderecos(String login) {
        if (login == null || login.isBlank()) {
            throw new ValidationException("Usuário não autenticado");
        }
        Usuario cliente = usuarioService.buscarPorLogin(login);
        if (cliente == null) {
            throw new ValidationException("Usuário não encontrado");
        }
        return cliente.getEnderecos().stream()
                .map(EnderecoMapper::toResponseEnderecoClienteDTO)
                .toList();
    }




    @Override
    @Transactional
    public EnderecoResponseClienteDTO adicionarEndereco(String login, EnderecoRequestClienteDTO dto) {
        if (login == null || login.isBlank()) {
            throw new ValidationException("Usuário não autenticado");
        }
        if (dto == null) {
            throw new ValidationException("Dados do endereço inválidos");
        }
        Usuario cliente = usuarioService.buscarPorLogin(login);
        if (cliente == null) {
            throw new ValidationException("Usuário não encontrado");
        }
        List<Endereco> enderecos = cliente.getEnderecos();
        if(dto.principal() == false && enderecos.isEmpty()) {
            throw new ValidationException("O primeiro endereço adicionado deve ser o principal");
        }

        if(dto.principal() == true) {
            enderecos.forEach(endereco -> endereco.setPrincipal(false));
        }
        enderecos.add(EnderecoMapper.toEntityEnderecoCliente(dto));
        cliente.setEnderecos(enderecos);
        usuarioRepository.flush();
        Endereco endereco = cliente.getEnderecos().get(cliente.getEnderecos().size() - 1);
        return EnderecoMapper.toResponseEnderecoClienteDTO(endereco);
        }
    
    @Override
    @Transactional
    public void removerEndereco(String login, Long enderecoId) {
        if (login == null || login.isBlank()) {
            throw new ValidationException("Usuário não autenticado");
        }
        if (enderecoId == null) {
            throw new ValidationException("Endereço não informado");
        }
        Usuario cliente = usuarioService.buscarPorLogin(login);
        if (cliente == null) {
            throw new ValidationException("Usuário não encontrado");
        }
        List<Endereco> enderecos = cliente.getEnderecos();
        enderecos.removeIf(endereco -> endereco.getId().equals(enderecoId));
        cliente.setEnderecos(enderecos);
        usuarioRepository.persist(cliente);
    }

    @Override
    @Transactional
    public EnderecoResponseClienteDTO editarEndereco(String login, Long enderecoId, EnderecoRequestClienteDTO dto) {
        if (login == null || login.isBlank()) {
            throw new ValidationException("Usuário não autenticado");
        }
        if (dto == null) {
            throw new ValidationException("Dados do endereço inválidos");
        }
        Usuario cliente = usuarioService.buscarPorLogin(login);
        if (cliente == null) {
            throw new ValidationException("Usuário não encontrado");
        }
        List<Endereco> enderecos = cliente.getEnderecos();
        Endereco endereco = enderecos.stream()
                .filter(e -> e.getId().equals(enderecoId))
                .findFirst()
                .orElseThrow(() -> new ValidationException("Endereço não encontrado"));
        endereco.setRua(dto.rua());
        endereco.setCidade(dto.cidade());
        endereco.setBairro(dto.bairro());
        endereco.setEstado(dto.estado());
        endereco.setCep(dto.cep());
        endereco.setPrincipal(dto.principal());
        endereco.setRua(dto.rua());
        if(dto.principal() == true) {
            enderecos.forEach(e -> {
                if (!e.getId().equals(enderecoId)) {
                    e.setPrincipal(false);
        }
            });
        }
        return EnderecoMapper.toResponseEnderecoClienteDTO(endereco);
    }

    @Override
    public EnderecoResponseClienteDTO obterEnderecoPrincipal(String login) {
        if (login == null || login.isBlank()) {
            throw new ValidationException("Usuário não autenticado");
        }
        Usuario cliente = usuarioService.buscarPorLogin(login);
        if (cliente == null) {
            throw new ValidationException("Usuário não encontrado");
        }
        Endereco enderecoPrincipal = cliente.getEnderecos().stream()
                .filter(Endereco::isPrincipal)
                .findFirst()
                .orElseThrow(() -> new ValidationException("Endereço principal não encontrado"));
        return EnderecoMapper.toResponseEnderecoClienteDTO(enderecoPrincipal);
    }
}
