package drones.services;

import java.util.List;

import drones.exception.ValidationException;
import drones.model.drones.Drone;
import drones.repository.DroneRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class DroneService implements DroneServiceInterface {
    @Inject
    DroneRepository droneRepository;

    @Override
    public Drone criar(Drone drone) {
        if (drone == null) {
            throw new ValidationException("Dados do drone são obrigatórios");
        }

        droneRepository.salvar(drone);
        return drone;
    }

    @Override
    @Transactional
    public boolean deletar(Long id) {
        if (id == null) {
            throw new ValidationException("Id do drone é obrigatório", "id");
        }
        return droneRepository.deleteById(id);
    }

    @Override
    public List<Drone> buscarTodos() {
        List<Drone> drones = droneRepository.findAll().list();
        if (drones.isEmpty()) {
            throw new ValidationException("Nenhum drone encontrado");
        }
        return drones;
    }

    @Override
    public Drone buscarPorId(Long id) {
        if (id == null) {
            throw new ValidationException("Id do drone é obrigatório", "id");
        }
        Drone drone = droneRepository.findById(id);
        if (drone == null) {
            throw new ValidationException("Drone com id '" + id + "' não encontrado", "id");
        }
        return drone;
    }

    @Override
    @Transactional
    public Drone atualizar(Long id, Drone dados) {
        if (id == null) {
            throw new ValidationException("Id do drone é obrigatório", "id");
        }
        if (dados == null) {
            throw new ValidationException("Dados do drone são obrigatórios");
        }

        Drone drone = droneRepository.findById(id);
        if (drone == null) {
            throw new ValidationException("Drone com id '" + id + "' não encontrado", "id");
        }
        FornecedorService fornecedorService = new FornecedorService();
        if (dados.getFornecedor() != null) {
            if(fornecedorService.buscarPorId(dados.getFornecedor().getId()) == null) {
                throw new ValidationException("Fornecedor do drone é inválido", "fornecedor");
            }
        }
        else {
            throw new ValidationException("Fornecedor do drone é obrigatório", "fornecedor");
        }

        

        drone.setNome(dados.getNome());
        drone.setMarca(dados.getMarca());
        drone.setModelo(dados.getModelo());
        drone.setPreco(dados.getPreco());
        drone.setAtiva(dados.isAtiva());
        drone.setTempoVooPratico(dados.getTempoVooPratico());
        drone.setPesoDecolagem(dados.getPesoDecolagem());
        drone.setAltitudeMaxima(dados.getAltitudeMaxima());
        drone.setVelocidadeMaxima(dados.getVelocidadeMaxima());
        drone.setAlcanceTransmissao(dados.getAlcanceTransmissao());
        drone.setPossuiCamera(dados.isPossuiCamera());
        drone.setFornecedor((fornecedorService.buscarPorId(dados.getFornecedor().getId())));

        return drone;
    }

    @Override
    public Drone buscarPorNome(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new ValidationException("Nome do drone é obrigatório", "nome");
        }
        Drone drone = droneRepository.findByNome(nome);
        if (drone == null) {
            throw new ValidationException("Drone com nome '" + nome + "' não encontrado", "nome");
        }
        return drone;
    }

    public List<Drone> buscarPorMarca(String marca) {
        if (marca == null || marca.isBlank()) {
            throw new ValidationException("Marca do drone é obrigatória", "marca");
        }
        List<Drone> drones = droneRepository.findByMarca(marca);
        if (drones.isEmpty()) {
            throw new ValidationException("Nenhum drone encontrado para a marca '" + marca + "'", "marca");
        }
        return drones;
    }

    public List<Drone> buscarPorModelo(String modelo) {
        if (modelo == null || modelo.isBlank()) {
            throw new ValidationException("Modelo do drone é obrigatório", "modelo");
        }
        List<Drone> drones = droneRepository.findByModelo(modelo);
        if (drones.isEmpty()) {
            throw new ValidationException("Nenhum drone encontrado para o modelo '" + modelo + "'", "modelo");
        }
        return drones;
    }

    public List<Drone> buscarPorPreco(double precoMin, double precoMax) {
        if (precoMin < 0 || precoMax < 0) {
            throw new ValidationException("Preço mínimo e máximo devem ser positivos", "precoMin/precoMax");
        }
        if (precoMin > precoMax) {
            throw new ValidationException("Preço mínimo não pode ser maior que o preço máximo", "precoMin/precoMax");
        }
        List<Drone> drones = droneRepository.findByPrecoRange(precoMin, precoMax);
        if (drones.isEmpty()) {
            throw new ValidationException("Nenhum drone encontrado para a faixa de preço especificada", "precoMin/precoMax");
        }
        return drones;
    }
   
    
}
