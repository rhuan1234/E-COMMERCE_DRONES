package armas.services;

import java.util.List;

import armas.exception.ValidationException;
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
    @Transactional
    public Calibre criar(Calibre calibre) {
        if (calibre == null) {
            throw new ValidationException("Dados do calibre são obrigatórios");
        }
        calibreRepository.salvar(calibre);
        return calibre;
    }

    @Override
    @Transactional
    public boolean deletar(Long id) {
        if (id == null) {
            throw new ValidationException("Id do calibre é obrigatório", "id");
        }
        Calibre calibre = calibreRepository.findById(id);
        if (calibre == null) {
            return false;
        }
        if (!calibre.getFuzis().isEmpty()) {
            throw new ValidationException(
            "Não é possível excluir um calibre que está associado a fuzis"
        );
        }
        return calibreRepository.deleteById(id);
    }

    @Override
    public List<Calibre> buscarTodos() {
        return calibreRepository.findAll().list();
    }

    @Override
    public Calibre buscarPorId(Long id) {
        if (id == null) {
            throw new ValidationException("Id do calibre é obrigatório", "id");
        }
        return calibreRepository.findById(id);
    }

    @Override
    @Transactional
    public Calibre atualizar(Long id, Calibre dados) {
        if (id == null) {
            throw new ValidationException("Id do calibre é obrigatório", "id");
        }
        if (dados == null) {
            throw new ValidationException("Dados do calibre são obrigatórios");
        }
        Calibre calibre = calibreRepository.findById(id);
        if (calibre == null) {
            return null;
        }
        calibre.setNome(dados.getNome());
        calibre.setMarca(dados.getMarca());
        return calibre;
    }

    @Override
    public Calibre buscarPorNome(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new ValidationException("Nome do calibre é obrigatório", "nome");
        }
        return calibreRepository.findByNome(nome);
    }
}
