package drones.services;

import java.time.LocalDateTime;
import java.util.List;

import drones.dto.drones.AvaliacaoRequestDTO;
import drones.exception.UnauthorizedException;
import drones.exception.ValidationException;
import drones.model.drones.Avaliacao;
import drones.model.drones.Drone;
import drones.model.usuario.Usuario;
import drones.repository.AvaliacaoRepository;
import drones.repository.DroneRepository;
import drones.repository.UsuarioRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class AvaliacaoService implements AvaliacaoServiceInterface {

    @Inject
    AvaliacaoRepository avaliacaoRepository;

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    DroneRepository droneRepository;

    @Override
    public List<Avaliacao> buscarTodos() {
        return avaliacaoRepository.findAll().list();
    }

    @Override
    public List<Avaliacao> buscarPorDrone(Long droneId) {
        validarId(droneId, "droneId", "Id do drone inválido");
        validarDrone(droneId);
        return avaliacaoRepository.findByDroneId(droneId);
    }

    @Override
    public Avaliacao buscarPorId(Long id) {
        validarId(id, "id", "Id da avaliação inválido");
        return avaliacaoRepository.findById(id);
    }

    @Override
    @Transactional
    public Avaliacao criar(AvaliacaoRequestDTO dados, String login) {
        validarDados(dados);
        Usuario usuario = buscarUsuario(login);
        Drone drone = validarDrone(dados.droneId());

        if (avaliacaoRepository.findByUsuarioAndDrone(usuario.getId(), drone.getId()) != null) {
            throw new ValidationException("O usuário já avaliou este drone", "droneId");
        }

        Avaliacao avaliacao = new Avaliacao();
        preencher(avaliacao, dados);
        avaliacao.setUsuario(usuario);
        avaliacao.setDrone(drone);
        avaliacao.setDataAvaliacao(LocalDateTime.now());
        avaliacaoRepository.persist(avaliacao);
        return avaliacao;
    }

    @Override
    @Transactional
    public Avaliacao atualizar(Long id, AvaliacaoRequestDTO dados, String login) {
        validarId(id, "id", "Id da avaliação inválido");
        validarDados(dados);
        Usuario usuario = buscarUsuario(login);
        Avaliacao avaliacao = avaliacaoRepository.findById(id);
        if (avaliacao == null) {
            return null;
        }
        validarAcesso(avaliacao, usuario);
        Drone drone = validarDrone(dados.droneId());
        preencher(avaliacao, dados);
        avaliacao.setDrone(drone);
        return avaliacao;
    }

    @Override
    @Transactional
    public boolean deletar(Long id, String login) {
        validarId(id, "id", "Id da avaliação inválido");
        Usuario usuario = buscarUsuario(login);
        Avaliacao avaliacao = avaliacaoRepository.findById(id);
        if (avaliacao == null) {
            return false;
        }
        validarAcesso(avaliacao, usuario);
        return avaliacaoRepository.deleteById(id);
    }

    private void preencher(Avaliacao avaliacao, AvaliacaoRequestDTO dados) {
        avaliacao.setNota(dados.nota());
        avaliacao.setComentario(dados.comentario());
    }

    private Usuario buscarUsuario(String login) {
        if (login == null || login.isBlank()) {
            throw new UnauthorizedException("Usuário não autenticado");
        }
        return usuarioRepository.findByLogin(login)
            .orElseThrow(() -> new ValidationException("Usuário não encontrado", "usuario"));
    }

    private Drone validarDrone(Long droneId) {
        validarId(droneId, "droneId", "Id do drone inválido");
        Drone drone = droneRepository.findById(droneId);
        if (drone == null) {
            throw new ValidationException("Drone não encontrado", "droneId");
        }
        return drone;
    }

    private void validarDados(AvaliacaoRequestDTO dados) {
        if (dados == null) {
            throw new ValidationException("Dados da avaliação são obrigatórios");
        }
        if (dados.nota() == null || dados.nota() < 1 || dados.nota() > 5) {
            throw new ValidationException("A nota deve ser entre 1 e 5", "nota");
        }
        if (dados.comentario() != null && dados.comentario().length() > 1000) {
            throw new ValidationException("O comentário deve ter no máximo 1000 caracteres", "comentario");
        }
        validarId(dados.droneId(), "droneId", "Id do drone inválido");
    }

    private void validarAcesso(Avaliacao avaliacao, Usuario usuario) {
        if (avaliacao.getUsuario() == null || !avaliacao.getUsuario().getId().equals(usuario.getId())) {
            throw new UnauthorizedException("Você não pode alterar esta avaliação");
        }
    }

    private void validarId(Long id, String campo, String mensagem) {
        if (id == null || id <= 0) {
            throw new ValidationException(mensagem, campo);
        }
    }
}