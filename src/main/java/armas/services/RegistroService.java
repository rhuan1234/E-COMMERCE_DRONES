package armas.services;

import java.util.List;

import armas.model.registro.Registro;
import armas.repository.RegistroRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class RegistroService implements RegistroServiceInterface{
    @Inject
    RegistroRepository registroRepository;

    @Override
    @Transactional
    public Registro create(Registro registro) {
        registroRepository.salvar(registro);
        return registro;
    }

    @Override
    @Transactional
    public boolean delete(Long id) {
        return registroRepository.deleteById(id);
        
    }

    @Override
    public List<Registro> findAll() {
        return registroRepository.findAll().list();
    }

    @Override
    public Registro findById(Long id) {
        return registroRepository.findById(id);
    }

    @Override
    @Transactional
    public Registro update(Long id, Registro dados) {
        Registro registro = registroRepository.findById(id);
        registro.setDataRegistro(dados.getDataRegistro());
        registro.setNumeroSerie(dados.getNumeroSerie());

        return registro;
    }
}