package armas.services;

import java.util.List;

import armas.exception.ValidationException;
import armas.model.mira.RedDot;
import armas.repository.RedDotRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class RedDotService implements RedDotServiceInterface {

    @Inject
    RedDotRepository miraRepository;

    @Override
    @Transactional
    public RedDot criar(RedDot mira) {
        if (mira == null) {
            throw new ValidationException("Dados do red dot são obrigatórios");
        }
        miraRepository.salvar(mira);
        return mira;
    }

    @Override
    @Transactional
    public boolean deletar(Long id) {
        if (id == null) {
            throw new ValidationException("Id do red dot é obrigatório", "id");
        }
        RedDot mira = miraRepository.findById(id);
        if (mira == null) {
            throw new ValidationException("Red dot não encontrado para o id: " + id);
        }
        if (!mira.getFuzis().isEmpty()) {
            throw new ValidationException(
            "Não é possível excluir uma mira RedDot que está associado a fuzis"
        );
        }
        return miraRepository.deleteById(id);
    }

    @Override
    public List<RedDot> buscarTodos() {
        List<RedDot> miras = miraRepository.findAll().list();
        if (miras.isEmpty()) {
            throw new ValidationException("Nenhuma mira RedDot encontrada");
        }
        return miras;
    }

    @Override
    public RedDot buscarPorId(Long id) {
        if (id == null) {
            throw new ValidationException("Id do red dot é obrigatório", "id");
        }
        return miraRepository.findById(id);
    }

    @Override
    @Transactional
    public RedDot atualizar(Long id, RedDot dados) {
        if (id == null) {
            throw new ValidationException("Id do red dot é obrigatório", "id");
        }
        if (dados == null) {
            throw new ValidationException("Dados do red dot são obrigatórios");
        }
        RedDot mira = miraRepository.findById(id);
        if (mira == null) {
            return null;
        }
        mira.setModelo(dados.getModelo());
        mira.setMarca(dados.getMarca());
        mira.setAumentoMaximo(dados.getAumentoMaximo());
        mira.setNiveisBrilho(dados.getNiveisBrilho());
        mira.setDuracaoBateria(dados.getDuracaoBateria());
        return mira;
    }

    @Override
    public RedDot buscarPorModelo(String modelo) {
        if (modelo == null || modelo.isBlank()) {
            throw new ValidationException("Modelo do red dot é obrigatório", "modelo");
        }
        return miraRepository.findByModelo(modelo);
    }
}
