package armas.services;

import java.util.List;

import armas.exception.ValidationException;
import armas.model.armas.Fuzil;
import armas.repository.FuzilRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class FuzilService implements FuzilServiceInterface {
    @Inject
    FuzilRepository fuzilRepository;

    @Override
    public Fuzil criar(Fuzil fuzil) {
        if (fuzil == null) {
            throw new ValidationException("Dados do fuzil são obrigatórios");
        }

        fuzilRepository.salvar(fuzil);
        return fuzil;
    }

    @Override
    @Transactional
    public boolean deletar(Long id) {
        if (id == null) {
            throw new ValidationException("Id do fuzil é obrigatório", "id");
        }
        return fuzilRepository.deleteById(id);
    }

    @Override
    public List<Fuzil> buscarTodos() {
        List<Fuzil> fuzis = fuzilRepository.findAll().list();
        if (fuzis.isEmpty()) {
            throw new ValidationException("Nenhum fuzil encontrado");
        }
        return fuzis;
    }

    @Override
    public Fuzil buscarPorId(Long id) {
        if (id == null) {
            throw new ValidationException("Id do fuzil é obrigatório", "id");
        }
        Fuzil fuzil = fuzilRepository.findById(id);
        if (fuzil == null) {
            throw new ValidationException("Fuzil com id '" + id + "' não encontrado", "id");
        }
        return fuzil;
    }

    @Override
    @Transactional
    public Fuzil atualizar(Long id, Fuzil dados) {
        if (id == null) {
            throw new ValidationException("Id do fuzil é obrigatório", "id");
        }
        if (dados == null) {
            throw new ValidationException("Dados do fuzil são obrigatórios");
        }

        Fuzil fuzil = fuzilRepository.findById(id);
        if (fuzil == null) {
            throw new ValidationException("Fuzil com id '" + id + "' não encontrado", "id");
        }

        

        fuzil.setNome(dados.getNome());
        fuzil.setMarca(dados.getMarca());
        fuzil.setModelo(dados.getModelo());
        fuzil.setPreco(dados.getPreco());
        fuzil.setAtiva(dados.isAtiva());
        fuzil.setCalibres(dados.getCalibres());
        fuzil.setModoDisparo(dados.getModoDisparo());
        fuzil.setAlcanceEfetivo(dados.getAlcanceEfetivo());
        fuzil.setPossuiTrilhoTatico(dados.isPossuiTrilhoTatico());
        fuzil.setFornecedor(dados.getFornecedor());
        fuzil.setCarregador(dados.getCarregador());
        fuzil.setMiras(dados.getMiras());
        
        // Atualizar registro: se um novo registro foi fornecido, atualizar os campos do registro existente
        if (dados.getRegistro() != null) {
            if (fuzil.getRegistro() == null) {
                fuzil.setRegistro(dados.getRegistro());
            } else {
                // Atualizar os campos do registro existente em vez de trocar o objeto
                fuzil.getRegistro().setDataRegistro(dados.getRegistro().getDataRegistro());
                fuzil.getRegistro().setNumeroSerie(dados.getRegistro().getNumeroSerie());
            }
        }

        return fuzil;
    }

    @Override
    public Fuzil buscarPorNome(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new ValidationException("Nome do fuzil é obrigatório", "nome");
        }
        Fuzil fuzil = fuzilRepository.findByNome(nome);
        if (fuzil == null) {
            throw new ValidationException("Fuzil com nome '" + nome + "' não encontrado", "nome");
        }
        return fuzil;
    }

    public List<Fuzil> buscarPorMarca(String marca) {
        if (marca == null || marca.isBlank()) {
            throw new ValidationException("Marca do fuzil é obrigatória", "marca");
        }
        List<Fuzil> fuzis = fuzilRepository.findByMarca(marca);
        if (fuzis.isEmpty()) {
            throw new ValidationException("Nenhum fuzil encontrado para a marca '" + marca + "'", "marca");
        }
        return fuzis;
    }

    public List<Fuzil> buscarPorModelo(String modelo) {
        if (modelo == null || modelo.isBlank()) {
            throw new ValidationException("Modelo do fuzil é obrigatório", "modelo");
        }
        List<Fuzil> fuzis = fuzilRepository.findByModelo(modelo);
        if (fuzis.isEmpty()) {
            throw new ValidationException("Nenhum fuzil encontrado para o modelo '" + modelo + "'", "modelo");
        }
        return fuzis;
    }

    public List<Fuzil> buscarPorPreco(double precoMin, double precoMax) {
        if (precoMin < 0 || precoMax < 0) {
            throw new ValidationException("Preço mínimo e máximo devem ser positivos", "precoMin/precoMax");
        }
        if (precoMin > precoMax) {
            throw new ValidationException("Preço mínimo não pode ser maior que o preço máximo", "precoMin/precoMax");
        }
        List<Fuzil> fuzis = fuzilRepository.findByPrecoRange(precoMin, precoMax);
        if (fuzis.isEmpty()) {
            throw new ValidationException("Nenhum fuzil encontrado para a faixa de preço especificada", "precoMin/precoMax");
        }
        return fuzis;
    }
   
    
}
