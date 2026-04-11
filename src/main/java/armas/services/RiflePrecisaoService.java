package armas.services;

import java.util.List;

import armas.model.armas.RiflePrecisao;
import armas.repository.RiflePrecisaoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class RiflePrecisaoService implements RiflePrecisaoServiceInterface {

    @Inject
    RiflePrecisaoRepository riflePrecisaoRepository;

    @Override
    public RiflePrecisao create(RiflePrecisao riflePrecisao) {
        riflePrecisaoRepository.salvar(riflePrecisao);
        return riflePrecisao;
    }

    @Override
    public List<RiflePrecisao> findAll() {
        return riflePrecisaoRepository.findAll().list();
    }

    @Override
    public RiflePrecisao findById(Long id) {
        return riflePrecisaoRepository.findById(id);
    }

    @Override
    @Transactional
    public boolean delete(Long id) {
        return riflePrecisaoRepository.deleteById(id);
    }

    @Override
    @Transactional
    public RiflePrecisao update(Long id, RiflePrecisao dados) {
        RiflePrecisao rifle = riflePrecisaoRepository.findById(id);
        rifle.setNome(dados.getNome());
        rifle.setMarca(dados.getMarca());
        rifle.setModelo(dados.getModelo());
        rifle.setNumeroSerie(dados.getNumeroSerie());
        rifle.setPreco(dados.getPreco());
        
        rifle.setAtiva(dados.isAtiva());
        rifle.setComprimentoCano(dados.getComprimentoCano());
        rifle.setPossuiMiraTelescopica(dados.isPossuiMiraTelescopica());
        rifle.setAlcanceEfetivo(dados.getAlcanceEfetivo());
        rifle.setTipoFuncionamento(dados.getTipoFuncionamento());
        // atributos herdados de Arma não alterados aqui; adiciona se necessário
        return rifle;
    }
}
