package armas.services;

import java.util.List;

import armas.model.armas.Fuzil;
import armas.repository.FuzilRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class FuzilService implements FuzilServiceInterface{
    @Inject
    FuzilRepository fuzilRepository;

    @Override
    public Fuzil create(Fuzil fuzil) {
        fuzilRepository.salvar(fuzil);
        return fuzil;
    }

    @Override
    @Transactional
    public boolean delete(Long id) {
        return fuzilRepository.deleteById(id);
        
    }

    @Override
    public List<Fuzil> findAll() {
        return fuzilRepository.findAll().list();
    }

    @Override
    public Fuzil findById(Long id) {
        return fuzilRepository.findById(id);
    }

    @Override
    @Transactional
    public Fuzil update(Long id, Fuzil dados) {
        Fuzil fuzil = fuzilRepository.findById(id);
        fuzil.setNome(dados.getNome());
        fuzil.setMarca(dados.getMarca());
        fuzil.setModelo(dados.getModelo());
        fuzil.setNumeroSerie(dados.getNumeroSerie());
        fuzil.setPreco(dados.getPreco());
        
        fuzil.setAtiva(dados.isAtiva());
        fuzil.setCalibre(dados.getCalibre());
        fuzil.setModoDisparo(dados.getModoDisparo());
        fuzil.setCapacidadeCarregador(dados.getCapacidadeCarregador());
        fuzil.setAlcanceEfetivo(dados.getAlcanceEfetivo());
        fuzil.setPossuiTrilhoTatico(dados.isPossuiTrilhoTatico());

        return fuzil;
    }

    
}