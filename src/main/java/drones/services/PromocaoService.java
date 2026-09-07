package drones.services;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import drones.exception.ValidationException;
import drones.model.drones.Drone;
import drones.model.promocao.Promocao;
import drones.repository.DroneRepository;
import drones.repository.PromocaoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class PromocaoService implements PromocaoServiceInterface {
    @Inject
    PromocaoRepository promocaoRepository;

    @Inject
    DroneRepository droneRepository;

    @Override
    @Transactional
    public Promocao criar(Promocao promocao, List<Long> droneIds) {
        validarDados(promocao);
        promocaoRepository.salvar(promocao);
        associarDrones(promocao, droneIds);
        return promocao;
    }

    @Override
    public List<Promocao> buscarTodos() {
        return promocaoRepository.findAll().list();
    }

    @Override
    public Promocao buscarPorId(Long id) {
        validarId(id);
        Promocao promocao = promocaoRepository.findById(id);
        if (promocao == null) {
            throw new ValidationException("Promoção com id '" + id + "' não encontrada", "id");
        }
        return promocao;
    }

    @Override
    @Transactional
    public Promocao atualizar(Long id, Promocao dados, List<Long> droneIds) {
        validarId(id);
        validarDados(dados);
        Promocao promocao = buscarPorId(id);

        promocao.setNome(dados.getNome());
        promocao.setPercentualDesconto(dados.getPercentualDesconto());
        promocao.setDataInicio(dados.getDataInicio());
        promocao.setDataFim(dados.getDataFim());

        promocao.getDrones().forEach(drone -> drone.setPromocao(null));
        promocao.getDrones().clear();
        associarDrones(promocao, droneIds);
        return promocao;
    }

    @Override
    @Transactional
    public boolean deletar(Long id) {
        Promocao promocao = buscarPorId(id);
        if (!promocao.getDrones().isEmpty()) {
            throw new ValidationException("Não é possível excluir uma promoção com drones associados", "id");
        }
        return promocaoRepository.deleteById(id);
    }

    private void associarDrones(Promocao promocao, List<Long> droneIds) {
        if (droneIds == null || droneIds.isEmpty()) {
            return;
        }

        Set<Long> idsUnicos = new HashSet<>(droneIds);
        if (idsUnicos.size() != droneIds.size() || idsUnicos.contains(null)) {
            throw new ValidationException("A lista de drones contém ids duplicados ou inválidos", "droneIds");
        }

        List<Drone> drones = droneRepository.find("id in ?1", idsUnicos).list();
        if (drones.size() != idsUnicos.size()) {
            throw new ValidationException("Um ou mais drones informados não foram encontrados", "droneIds");
        }

        for (Drone drone : drones) {
            if (drone.getPromocao() != null && !drone.getPromocao().getId().equals(promocao.getId())) {
                throw new ValidationException(
                        "O drone com id '" + drone.getId() + "' já está cadastrado em outra promoção",
                        "droneIds");
            }
            drone.setPromocao(promocao);
            promocao.getDrones().add(drone);
        }
    }

    private void validarDados(Promocao promocao) {
        if (promocao == null) {
            throw new ValidationException("Dados da promoção são obrigatórios");
        }
        if (promocao.getDataInicio().isAfter(promocao.getDataFim())) {
            throw new ValidationException("Data de início não pode ser posterior à data de fim", "dataInicio/dataFim");
        }
    }

    private void validarId(Long id) {
        if (id == null || id <= 0) {
            throw new ValidationException("Id da promoção é inválido", "id");
        }
    }
}