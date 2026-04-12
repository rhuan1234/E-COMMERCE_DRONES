package armas.services;

import java.util.List;

import armas.model.fornecedor.Telefone;
import armas.repository.TelefoneRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class TelefoneService implements TelefoneServiceInterface {
    
    @Inject
    TelefoneRepository telefoneRepository;

    @Override
    @Transactional
    public Telefone create(Telefone telefone) {
        telefoneRepository.salvar(telefone);
        return telefone;
    }

    @Override
    @Transactional
    public boolean delete(Long id) {
        return telefoneRepository.deleteById(id);
    }

    @Override
    public List<Telefone> findAll() {
        return telefoneRepository.findAll().list();
    }

    @Override
    public Telefone findById(Long id) {
        return telefoneRepository.findById(id);
    }

    @Override
    @Transactional
    public Telefone update(Long id, Telefone dados) {
        Telefone telefone = telefoneRepository.findById(id);
        telefone.setNumero(dados.getNumero());
        return telefone;
    }
}
