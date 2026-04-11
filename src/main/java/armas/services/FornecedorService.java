package armas.services;

import java.util.List;

import armas.model.fornecedor.Fornecedor;
import armas.repository.FornecedorRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class FornecedorService implements FornecedorServiceInterface{
    @Inject
    FornecedorRepository fornecedorRepository;

    @Override
    public Fornecedor create(Fornecedor fornecedor) {
        fornecedorRepository.salvar(fornecedor);
        return fornecedor;
    }

    @Override
    @Transactional
    public boolean delete(Long id) {
        return fornecedorRepository.deleteById(id);
        
    }

    @Override
    public List<Fornecedor> findAll() {
        return fornecedorRepository.findAll().list();
    }

    @Override
    public Fornecedor findById(Long id) {
        return fornecedorRepository.findById(id);
    }

    @Override
    @Transactional
    public Fornecedor update(Long id, Fornecedor dados) {
        Fornecedor fornecedor = fornecedorRepository.findById(id);
        fornecedor.setNome(dados.getNome());
        fornecedor.setCnpj(dados.getCnpj());
        fornecedor.setEmail(dados.getEmail());
        fornecedor.setTelefone(dados.getTelefone());
        fornecedor.setEndereco(dados.getEndereco());
        fornecedor.setAtivo(dados.isAtivo());

        return fornecedor;
    }

    
}
