package armas.services;

import java.util.List;

import armas.exception.ValidationException;
import armas.model.mira.MiraHolografica;
import armas.repository.MiraHolograficaRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class MiraHolograficaService implements MiraHolograficaServiceInterface {

    @Inject
    MiraHolograficaRepository miraRepository;

    @Override
    @Transactional
    public MiraHolografica criar(MiraHolografica mira) {
        if (mira == null) {
            throw new ValidationException("Dados da mira holográfica são obrigatórios");
        }
        miraRepository.salvar(mira);
        return mira;
    }

    @Override
    @Transactional
    public boolean deletar(Long id) {
        if (id == null) {
            throw new ValidationException("Id da mira holográfica é obrigatório", "id");
        }
        MiraHolografica mira = miraRepository.findById(id);
        if (mira == null) {
            throw new ValidationException("Mira holográfica não encontrada para o id: " + id);
        }
        if (!mira.getFuzis().isEmpty()) {
            throw new ValidationException(
            "Não é possível excluir uma mira holográfica que está associada a fuzis"
        );
        }
        return miraRepository.deleteById(id);
    }

    @Override
    public List<MiraHolografica> buscarTodos() {
        List<MiraHolografica> miras = miraRepository.findAll().list();
        if (miras.isEmpty()) {
            throw new ValidationException("Nenhuma mira holográfica encontrada");
        }
        return miras;
    }

    @Override
    public MiraHolografica buscarPorId(Long id) {
        if (id == null) {
            throw new ValidationException("Id da mira holográfica é obrigatório", "id");
        }
        return miraRepository.findById(id);
    }

    @Override
    @Transactional
    public MiraHolografica atualizar(Long id, MiraHolografica dados) {
        if (id == null) {
            throw new ValidationException("Id da mira holográfica é obrigatório", "id");
        }
        if (dados == null) {
            throw new ValidationException("Dados da mira holográfica são obrigatórios");
        }
        MiraHolografica mira = miraRepository.findById(id);
        if (mira == null) {
            return null;
        }
        mira.setModelo(dados.getModelo());
        mira.setMarca(dados.getMarca());
        mira.setAumentoMaximo(dados.getAumentoMaximo());
        mira.setAlcanceLaser(dados.getAlcanceLaser());
        mira.setVisaoNoturna(dados.isVisaoNoturna());
        return mira;
    }

    @Override
    public MiraHolografica buscarPorModelo(String modelo) {
        if (modelo == null || modelo.isBlank()) {
            throw new ValidationException("Modelo da mira holográfica é obrigatório", "modelo");
        }
        return miraRepository.findByModelo(modelo);
    }
}
