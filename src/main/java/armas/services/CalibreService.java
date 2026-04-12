package armas.services;

import java.util.List;

import armas.model.armas.Calibre;
import armas.repository.CalibreRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class CalibreService implements CalibreServiceInterface{
    @Inject
    CalibreRepository calibreRepository;

    @Override
    public Calibre create(Calibre calibre) {
        calibreRepository.salvar(calibre);
        return calibre;
    }

    @Override
    @Transactional
    public boolean delete(Long id) {
        return calibreRepository.deleteById(id);
    }

    @Override
    public List<Calibre> findAll() {
        return calibreRepository.findAll().list();
    }

    @Override
    public Calibre findById(Long id) {
        return calibreRepository.findById(id);
    }

    @Override
    @Transactional
    public Calibre update(Long id, Calibre dados) {
        Calibre calibre = calibreRepository.findById(id);
        calibre.setNome(dados.getNome());
        calibre.setMarca(dados.getMarca());
        return calibre;
    }
}