package armas.services;

import java.util.List;

import armas.model.administrador.Administrador;
import armas.repository.AdministradorRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class AdministradorService implements AdministradorServiceInterface{
    @Inject
    AdministradorRepository usuarioRepository;

    @Override
    @Transactional
    public Administrador create(Administrador administrador) {
        usuarioRepository.salvar(administrador);
        return administrador;
    }

    @Override
    @Transactional
    public boolean delete(Long id) {
        return usuarioRepository.deleteById(id);
        
    }

    @Override
    public List<Administrador> findAll() {
        return usuarioRepository.findAll().list();
    }

    @Override
    public Administrador findById(Long id) {
        return usuarioRepository.findById(id);
    }

    @Override
    @Transactional
    public Administrador update(Long id, Administrador dados) {
        Administrador administrador = usuarioRepository.findById(id);
        administrador.setNome(dados.getNome());
        administrador.setEmail(dados.getEmail());
        administrador.setTelefone(dados.getTelefone());
        administrador.setCpf(dados.getCpf());
        administrador.setSenha(dados.getSenha());

        return administrador;
    }

    
}