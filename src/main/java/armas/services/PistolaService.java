package armas.services;

import java.util.List;

import armas.model.armas.Pistola;
import armas.repository.PistolaRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class PistolaService implements PistolaServiceInterface{
    @Inject
    PistolaRepository pistolaRepository;

    @Override
    public Pistola create(Pistola pistola){
        pistolaRepository.salvar(pistola);
        return pistola;
    }

    @Override
    public List<Pistola> findAll(){
        return pistolaRepository.findAll().list();
    }

    @Override
    public Pistola findById(Long id){
        return pistolaRepository.findById(id);
    }

    
    @Transactional
    @Override
    public boolean delete(Long id){
       return pistolaRepository.deleteById(id);
    }

    @Transactional
    @Override
    public Pistola update(Long id, Pistola dados){
        Pistola pistola = pistolaRepository.findById(id);
        pistola.setNome(dados.getNome());
        pistola.setMarca(dados.getMarca());
        pistola.setModelo(dados.getModelo());
        pistola.setNumeroSerie(dados.getNumeroSerie());
        pistola.setPreco(dados.getPreco());
        
        pistola.setAtiva(dados.isAtiva());
        pistola.setCapacidadeCarregador(dados.getCapacidadeCarregador());
        pistola.setTipoAcao(dados.getTipoAcao());
        pistola.setPossuiTravaSeguranca(dados.isPossuiTravaSeguranca());
        pistola.setPossuiTrilho(dados.isPossuiTrilho());

        return pistola;
    }
}
