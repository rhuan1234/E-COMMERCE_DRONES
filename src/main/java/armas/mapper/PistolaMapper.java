package armas.mapper;

import armas.dto.armas.PistolaRequestDTO;
import armas.dto.armas.PistolaResponseDTO;
import armas.model.armas.Calibre;
import armas.model.armas.Pistola;
import armas.model.armas.TipoAcao;
import armas.repository.FornecedorRepository;

public class PistolaMapper {

    public static Pistola toEntity(PistolaRequestDTO dto){
        Pistola pistola = new Pistola();

        pistola.setNome(dto.nome());
        pistola.setMarca(dto.marca());
        pistola.setModelo(dto.modelo());
        pistola.setNumeroSerie(dto.numeroSerie());
        pistola.setPreco(dto.preco());
        
        pistola.setAtiva(dto.ativa());
        pistola.setCalibre(Calibre.fromDescricao(dto.calibre()));
        if(dto.fornecedorId() != null){
            FornecedorRepository fornecedorRepository = new FornecedorRepository();
            if (fornecedorRepository.findById(dto.fornecedorId()) != null) {
                pistola.setFornecedor(fornecedorRepository.findById(dto.fornecedorId()));
            } 

        }

        // 🔹 campos da Pistola
        pistola.setCapacidadeCarregador(dto.capacidadeCarregador());
        pistola.setTipoAcao(TipoAcao.fromTipo(dto.tipoAcao()));
        pistola.setPossuiTravaSeguranca(dto.possuiTravaSeguranca());
        pistola.setPossuiTrilho(dto.possuiTrilho());

    return pistola;
    }

    public static PistolaResponseDTO toResponseDTO(Pistola pistola){
        
    return new PistolaResponseDTO(
        // 🔹 Arma
        pistola.getId(),
        pistola.getNome(),
        pistola.getMarca(),
        pistola.getModelo(),
        pistola.getNumeroSerie(),
        pistola.getPreco(),
        
        pistola.isAtiva(),
        pistola.getCalibre().name(),
        pistola.getFornecedor() != null ? pistola.getFornecedor().getId() : null,
        // 🔹 Pistola
        pistola.getCapacidadeCarregador(),
        pistola.getTipoAcao().name(),
        pistola.isPossuiTravaSeguranca(),
        pistola.isPossuiTrilho()
    );
    }
}
