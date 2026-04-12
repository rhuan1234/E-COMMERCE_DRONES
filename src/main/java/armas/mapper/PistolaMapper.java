package armas.mapper;

import armas.dto.armas.PistolaRequestDTO;
import armas.dto.armas.PistolaResponseDTO;
import armas.model.armas.Calibre;
import armas.model.armas.Pistola;
import armas.model.armas.TipoAcao;
import armas.repository.FornecedorRepository;
import armas.repository.CalibreRepository;

public class PistolaMapper {

    public static Pistola toEntity(PistolaRequestDTO dto){
        Pistola pistola = new Pistola();

        pistola.setNome(dto.nome());
        pistola.setMarca(dto.marca());
        pistola.setModelo(dto.modelo());
        pistola.setPreco(dto.preco());
        
        pistola.setAtiva(dto.ativa());
        CalibreRepository calibreRepository = new CalibreRepository();
        pistola.setCalibres(dto.calibres().stream().map(calibreRepository::findById).toList());
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
        pistola.getPreco(),
        
        pistola.isAtiva(),
        pistola.getCalibres().stream().map(Calibre::getId).toList(),
         // pegando o nome do primeiro calibre, ajuste conforme necessário
         pistola.getFornecedor() != null ? pistola.getFornecedor().getId() : null,
        // 🔹 Pistola
        pistola.getCapacidadeCarregador(),
        pistola.getTipoAcao().name(),
        pistola.isPossuiTravaSeguranca(),
        pistola.isPossuiTrilho()
    );
    }
}
