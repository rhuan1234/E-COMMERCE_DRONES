package armas.mapper;

import armas.dto.armas.RiflePrecisaoRequestDTO;
import armas.dto.armas.RiflePrecisaoResponseDTO;
import armas.model.armas.Calibre;
import armas.model.armas.RiflePrecisao;
import armas.model.armas.TipoFuncionamento;
import armas.repository.CalibreRepository;
import armas.repository.FornecedorRepository;

public class RiflePrecisaoMapper {

    public static RiflePrecisao toEntity(RiflePrecisaoRequestDTO dto) {
        
        RiflePrecisao rifle = new RiflePrecisao();

        rifle.setNome(dto.nome());
        rifle.setMarca(dto.marca());
        rifle.setModelo(dto.modelo());
        rifle.setPreco(dto.preco());
        
        rifle.setAtiva(dto.ativa());
         if(dto.fornecedorId() != null){
            FornecedorRepository fornecedorRepository = new FornecedorRepository();
            if (fornecedorRepository.findById(dto.fornecedorId()) != null) {
                rifle.setFornecedor(fornecedorRepository.findById(dto.fornecedorId()));
            } 

        }
        CalibreRepository calibreRepository = new CalibreRepository();
        rifle.setCalibres(dto.calibres().stream().map(calibreRepository::findById).toList());
        rifle.setComprimentoCano(dto.comprimentoCano());
        rifle.setPossuiMiraTelescopica(dto.possuiMiraTelescopica());
        rifle.setAlcanceEfetivo(dto.alcanceEfetivo());
        // assumindo que o tipo funciona como enum; ajuste caso seja diferente
        rifle.setTipoFuncionamento(TipoFuncionamento.fromTipo(dto.tipoFuncionamento()));

        return rifle;
    }

    public static RiflePrecisaoResponseDTO toResponseDTO(RiflePrecisao rifle) {
        return new RiflePrecisaoResponseDTO(
            rifle.getId(),
            rifle.getNome(),
            rifle.getMarca(),
            rifle.getModelo(),
            rifle.getPreco(),
            
            rifle.isAtiva(),
            rifle.getCalibres().stream().map(Calibre::getId).toList(),
             // pegando o nome do primeiro calibre, ajuste conforme necessário
            rifle.getFornecedor() != null ? rifle.getFornecedor().getId() : null,
            rifle.getComprimentoCano(),
            rifle.isPossuiMiraTelescopica(),
            rifle.getAlcanceEfetivo(),
            rifle.getTipoFuncionamento() != null ? rifle.getTipoFuncionamento().name() : null
        );
    }
}

