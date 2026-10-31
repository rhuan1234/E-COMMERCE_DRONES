package drones.services;

import java.util.List;

import drones.exception.ValidationException;
import drones.model.drones.Drone;
import drones.model.drones.DroneImage;
import drones.model.drones.Marca;
import drones.model.drones.Modelo;
import drones.repository.DroneImageRepository;
import drones.repository.DroneRepository;
import drones.repository.MarcaRepository;
import drones.repository.ModeloRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class DroneService implements DroneServiceInterface {
    @Inject
    DroneRepository droneRepository;
    @Inject
    DroneImageRepository droneImageRepository;
    @Inject
    DroneImageStorageService droneImageStorageService;
    @Inject
    FornecedorService fornecedorService;
    @Inject
    MarcaRepository marcaRepository;
    @Inject
    ModeloRepository modeloRepository;

    private void validarMarcaEModelo(Drone drone) {
        if (drone.getMarca() == null || drone.getMarca().getId() == null) {
            throw new ValidationException("A marca do drone é obrigatória", "marcaId");
        }
        Marca marca = marcaRepository.findById(drone.getMarca().getId());
        if (marca == null) {
            throw new ValidationException("Marca do drone não encontrada", "marcaId");
        }

        if (drone.getModelo() == null || drone.getModelo().getId() == null) {
            throw new ValidationException("O modelo do drone é obrigatório", "modeloId");
        }
        Modelo modelo = modeloRepository.findById(drone.getModelo().getId());
        if (modelo == null) {
            throw new ValidationException("Modelo do drone não encontrado", "modeloId");
        }

        if (modelo.getMarca() == null || !modelo.getMarca().getId().equals(marca.getId())) {
            throw new ValidationException("O modelo selecionado não pertence à marca escolhida", "modeloId");
        }

        drone.setMarca(marca);
        drone.setModelo(modelo);
    }

    @Override
    public Drone criar(Drone drone) {
        if (drone == null) {
            throw new ValidationException("Dados do drone são obrigatórios");
        }
        validarMarcaEModelo(drone);
        if (drone.getFornecedor() != null) {
            if(fornecedorService.buscarPorId(drone.getFornecedor().getId()) == null) {
                throw new ValidationException("Fornecedor do drone é inválido", "fornecedor");
            }
        }
        else {
            throw new ValidationException("Fornecedor do drone é obrigatório", "fornecedor");
        }

        droneRepository.salvar(drone);
        return drone;
    }

    @Override
    @Transactional
    public Drone adicionarImagem(Long droneId, DroneImage imagem) {
        if (droneId == null || droneId <= 0) {
            throw new ValidationException("Id do drone é inválido", "id");
        }
        if (imagem == null || imagem.getCaminho() == null || imagem.getCaminho().isBlank()) {
            throw new ValidationException("O caminho da imagem é obrigatório", "caminho");
        }
        if (imagem.getOrdem() < 0) {
            throw new ValidationException("A ordem da imagem deve ser zero ou maior", "ordem");
        }

        Drone drone = droneRepository.findByIdForUpdate(droneId);
        if (drone == null) {
            throw new ValidationException("Drone com id '" + droneId + "' não encontrado", "id");
        }
        if (droneImageRepository.count("drone.id", droneId) >= 5) {
            throw new ValidationException("Um drone pode ter no máximo 5 imagens", "imagens");
        }

        imagem.setCaminho(imagem.getCaminho().trim());
        drone.adicionarImagem(imagem);
        droneImageRepository.salvar(imagem);
        return drone;
    }

    @Override
    @Transactional
    public void deletarImagem(Long droneId, Long imagemId) {
        if (droneId == null || droneId <= 0 || imagemId == null || imagemId <= 0) {
            throw new ValidationException("Os ids do drone e da imagem devem ser positivos");
        }
        DroneImage imagem = droneImageRepository.buscarPorDrone(imagemId, droneId);
        if (imagem == null) {
            throw new ValidationException("Imagem não encontrada para o drone informado", "imagemId");
        }

        droneImageStorageService.deletar(imagem.getCaminho());
        droneImageRepository.delete(imagem);
    }

    @Override
    public DroneImage buscarImagem(Long imagemId) {
        if (imagemId == null || imagemId <= 0) {
            throw new ValidationException("Id da imagem é inválido", "imagemId");
        }
        DroneImage imagem = droneImageRepository.findById(imagemId);
        if (imagem == null) {
            throw new ValidationException("Imagem com id '" + imagemId + "' não encontrada", "imagemId");
        }
        return imagem;
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
    public List<Drone> buscarTodos(int page, int pageSize) {
        List<Drone> drones = droneRepository.findAll().page(page, pageSize).list();
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

        validarMarcaEModelo(dados);

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
        drone.setCamera(dados.isPossuiCamera() ? dados.getCamera() : null);
        drone.setPossuiGPS(dados.isPossuiGPS());
        drone.setFornecedor((fornecedorService.buscarPorId(dados.getFornecedor().getId())));
        drone.setQuantidadeMotores(dados.getQuantidadeMotores());
        drone.setQuantidadeBaterias(dados.getQuantidadeBaterias());
        drone.setDuracaoBateria(dados.getDuracaoBateria());
        drone.setFrequenciaWifi(dados.getFrequenciaWifi());
        drone.setQuantidadeDisponivel(dados.getQuantidadeDisponivel());
        drone.setComControleRemoto(dados.isComControleRemoto());
        drone.setControladoPorAplicativo(dados.isControladoPorAplicativo());

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
        return buscarPorMarca(0, 10, marca);
    }

    public List<Drone> buscarPorMarca(int page, int pageSize, String marca) {
        if (marca == null || marca.isBlank()) {
            throw new ValidationException("Marca do drone é obrigatória", "marca");
        }
        List<Drone> drones = droneRepository.findByMarca(marca).page(page, pageSize).list();
        if (drones.isEmpty()) {
            throw new ValidationException("Nenhum drone encontrado para a marca '" + marca + "'", "marca");
        }
        return drones;
    }

    public List<Drone> buscarPorModelo(int page, int pageSize, String modelo) {
        if (modelo == null || modelo.isBlank()) {
            throw new ValidationException("Modelo do drone é obrigatório", "modelo");
        }
        List<Drone> drones = droneRepository.findByModelo(modelo).page(page, pageSize).list();
        if (drones.isEmpty()) {
            throw new ValidationException("Nenhum drone encontrado para o modelo '" + modelo + "'", "modelo");
        }
        return drones;
    }

    public List<Drone> buscarPorPreco(double precoMin, double precoMax) {
        return buscarPorPreco(0, 10, precoMin, precoMax);
    }

    public List<Drone> buscarPorPreco(int page, int pageSize, double precoMin, double precoMax) {
        if (precoMin < 0 || precoMax < 0) {
            throw new ValidationException("Preço mínimo e máximo devem ser positivos", "precoMin/precoMax");
        }
        if (precoMin > precoMax) {
            throw new ValidationException("Preço mínimo não pode ser maior que o preço máximo", "precoMin/precoMax");
        }
        List<Drone> drones = droneRepository.findByPrecoRange(precoMin, precoMax).page(page, pageSize).list();
        if (drones.isEmpty()) {
            throw new ValidationException("Nenhum drone encontrado para a faixa de preço especificada", "precoMin/precoMax");
        }
        return drones;
    }

    @Override
    public List<Drone> buscarComFiltros(
            int page,
            int pageSize,
            String nome,
            String marca,
            String modelo,
            Double precoMin,
            Double precoMax) {
        if ((precoMin != null && precoMin < 0) || (precoMax != null && precoMax < 0)) {
            throw new ValidationException("Preço mínimo e máximo devem ser positivos", "precoMin/precoMax");
        }
        if (precoMin != null && precoMax != null && precoMin > precoMax) {
            throw new ValidationException("Preço mínimo não pode ser maior que o preço máximo", "precoMin/precoMax");
        }
        return droneRepository.findByFiltros(nome, marca, modelo, precoMin, precoMax)
                .page(page, pageSize)
                .list();
    }
   
    public Long count() {
        return droneRepository.findAll().count();
    }

    public Long countModelos(String modelo) {
        return droneRepository.findByModelo(modelo).count();
    }

    public Long countMarcas(String marca) {
        return droneRepository.findByMarca(marca).count();
    }

    public Long countPreco(double precoMin, double precoMax) {
        return droneRepository.findByPrecoRange(precoMin, precoMax).count();
    }

    @Override
    public Long countComFiltros(String nome, String marca, String modelo, Double precoMin, Double precoMax) {
        return droneRepository.findByFiltros(nome, marca, modelo, precoMin, precoMax).count();
    }
}
