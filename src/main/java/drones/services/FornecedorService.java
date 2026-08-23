package drones.services;

import java.util.List;

import drones.exception.ValidationException;
import drones.model.fornecedor.Fornecedor;
import drones.repository.DroneRepository;
import drones.repository.EnderecoRepository;
import drones.repository.FornecedorRepository;
import drones.repository.TelefoneRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class FornecedorService implements FornecedorServiceInterface{
    @Inject
    FornecedorRepository fornecedorRepository;

    @Inject EnderecoRepository enderecoRepository;
    @Inject TelefoneRepository telefoneRepository;
    @Inject DroneRepository droneRepository;

    @Override
    @Transactional
    public Fornecedor criar(Fornecedor fornecedor) {
        if (fornecedor == null) {
            throw new ValidationException("Dados do fornecedor são obrigatórios");
        }
        fornecedorRepository.salvar(fornecedor);
        return fornecedor;
    }

    @Override
    @Transactional
    public boolean deletar(Long id) {
        if (id == null) {
            throw new ValidationException("Id do fornecedor é obrigatório", "id");
        }
        // Verificar se há drones associados a este fornecedor
        long count = droneRepository.find("fornecedor.id", id).count();
        if (count > 0) {
            return false; // Não permitir exclusão se houver drones associados
        }
        return fornecedorRepository.deleteById(id);
        
    }

    @Override
    public List<Fornecedor> buscarTodos() {
        return fornecedorRepository.findAll().list();
    }

    @Override
    public Fornecedor buscarPorId(Long id) {
        if (id == null) {
            throw new ValidationException("Id do fornecedor é obrigatório", "id");
        }
        return fornecedorRepository.findById(id);
    }

    @Override
    @Transactional
    public Fornecedor atualizar(Long id, Fornecedor dados) {
        if (id == null) {
            throw new ValidationException("Id do fornecedor é obrigatório", "id");
        }
        if (dados == null) {
            throw new ValidationException("Dados do fornecedor são obrigatórios");
        }
        Fornecedor fornecedor = fornecedorRepository.findById(id);
        if (fornecedor == null) {
            return null;
        }
        fornecedor.setNome(dados.getNome());
        fornecedor.setCnpj(dados.getCnpj());
        fornecedor.setEmail(dados.getEmail());
        fornecedor.setAtivo(dados.isAtivo());
        
        // Atualizar telefone: se o novo telefone foi fornecido, atualizar os campos do telefone existente
        if (dados.getTelefone() != null) {
            if (fornecedor.getTelefone() == null) {
                fornecedor.setTelefone(dados.getTelefone());
            } else {
                // Atualizar os campos do telefone existente em vez de trocar o objeto
                fornecedor.getTelefone().setNumero(dados.getTelefone().getNumero());
            }
        }
        
        // Atualizar endereço: se o novo endereço foi fornecido, atualizar os campos do endereço existente
        if (dados.getEndereco() != null) {
            if (fornecedor.getEndereco() == null) {
                fornecedor.setEndereco(dados.getEndereco());
            } else {
                // Atualizar os campos do endereço existente em vez de trocar o objeto
                fornecedor.getEndereco().setRua(dados.getEndereco().getRua());
                fornecedor.getEndereco().setBairro(dados.getEndereco().getBairro());
                fornecedor.getEndereco().setCidade(dados.getEndereco().getCidade());
                fornecedor.getEndereco().setEstado(dados.getEndereco().getEstado());
                fornecedor.getEndereco().setCep(dados.getEndereco().getCep());
            }
        }

        return fornecedor;
    }

    @Override
    public Fornecedor buscarPorNome(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new ValidationException("Nome do fornecedor é obrigatório", "nome");
        }
        return fornecedorRepository.findByNome(nome);
    }
    
}
