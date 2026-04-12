package armas.services;

import java.util.List;

import armas.model.fornecedor.Endereco;
import armas.repository.EnderecoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class EnderecoService implements EnderecoServiceInterface {

    @Inject
    EnderecoRepository enderecoRepository;

    @Override
    @Transactional
    public Endereco create(Endereco endereco) {
        enderecoRepository.salvar(endereco);
        return endereco;
    }

    @Override
    @Transactional
    public boolean delete(Long id) {
        return enderecoRepository.deleteById(id);
    }

    @Override
    public List<Endereco> findAll() {
        return enderecoRepository.findAll().list();
    }

    @Override
    public Endereco findById(Long id) {
        return enderecoRepository.findById(id);
    }

    @Override
    @Transactional
    public Endereco update(Long id, Endereco dados) {
        Endereco endereco = enderecoRepository.findById(id);
        endereco.setRua(dados.getRua());
        endereco.setBairro(dados.getBairro());
        endereco.setCidade(dados.getCidade());
        endereco.setEstado(dados.getEstado());
        endereco.setCep(dados.getCep());
        endereco.setFornecedor(dados.getFornecedor());
        return endereco;
    }
}
