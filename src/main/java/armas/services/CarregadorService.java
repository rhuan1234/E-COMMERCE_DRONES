package armas.services;

import java.util.List;

import armas.exception.ValidationException;
import armas.model.armas.Carregador;
import armas.repository.CarregadorRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class CarregadorService implements CarregadorServiceInterface {

    @Inject
    CarregadorRepository carregadorRepository;

    @Override
    @Transactional
    public Carregador criar(Carregador carregador) {
        if (carregador == null) {
            throw new ValidationException("Dados do carregador são obrigatórios");
        }
        carregadorRepository.salvar(carregador);
        return carregador;
    }

    @Override
    @Transactional
    public boolean deletar(Long id) {
        if (id == null) {
            throw new ValidationException("Id do carregador é obrigatório", "id");
        }
        return carregadorRepository.deleteById(id);
    }

    @Override
    public List<Carregador> buscarTodos() {
        return carregadorRepository.findAll().list();
    }

    @Override
    public Carregador buscarPorId(Long id) {
        if (id == null) {
            throw new ValidationException("Id do carregador é obrigatório", "id");
        }
        return carregadorRepository.findById(id);
    }

    @Override
    @Transactional
    public Carregador atualizar(Long id, Carregador dados) {
        if (id == null) {
            throw new ValidationException("Id do carregador é obrigatório", "id");
        }
        if (dados == null) {
            throw new ValidationException("Dados do carregador são obrigatórios");
        }
        Carregador carregador = carregadorRepository.findById(id);
        if (carregador == null) {
            return null;
        }
        carregador.setModelo(dados.getModelo());
        carregador.setQtdMunicao(dados.getQtdMunicao());
        carregador.setMarca(dados.getMarca());
        return carregador;
    }

    @Override
    public Carregador buscarPorModelo(String modelo) {
        if (modelo == null || modelo.isBlank()) {
            throw new ValidationException("Modelo do carregador é obrigatório", "modelo");
        }
        return carregadorRepository.findByModelo(modelo);
    }
}
