package armas.mapper;

import armas.dto.armas.FuzilRequestDTO;
import armas.dto.armas.FuzilResponseDTO;
import armas.dto.armas.FuzilResponseEcommerceDTO;
import armas.model.armas.Calibre;
import armas.model.armas.Fuzil;
import armas.model.armas.ModoDisparo;
import armas.model.mira.Mira;
import armas.repository.CalibreRepository;
import armas.repository.CarregadorRepository;
import armas.repository.FornecedorRepository;
import armas.repository.MiraRepository;

public class FuzilMapper {
    public static Fuzil toEntity(FuzilRequestDTO dto){
        
        Fuzil fuzil = new Fuzil();

        fuzil.setNome(dto.nome());
        fuzil.setMarca(dto.marca());
        fuzil.setModelo(dto.modelo());
        fuzil.setPreco(dto.preco());
        fuzil.setQuantidadeDisponivel(dto.quantidadeDisponivel());
        fuzil.setAtiva(dto.ativa());
        CalibreRepository calibreRepository = new CalibreRepository();
        fuzil.setCalibres(dto.calibres().stream().map(calibreRepository::findById).toList());
            if(dto.fornecedorId() != null){
                FornecedorRepository fornecedorRepository = new FornecedorRepository();
                if (fornecedorRepository.findById(dto.fornecedorId()) != null) {
                    fuzil.setFornecedor(fornecedorRepository.findById(dto.fornecedorId()));
                } 
    
            }
        // 🔹 campos da Fuzil
        fuzil.setModoDisparo(ModoDisparo.fromDescricao(dto.modoDisparo()));
        fuzil.setAlcanceEfetivo(dto.alcanceEfetivo());
        fuzil.setPossuiTrilhoTatico(dto.possuiTrilhoTatico());
        
        // Se um RegistroRequestDTO foi fornecido, usar o RegistroMapper
        if (dto.registro() != null) {
            fuzil.setRegistro(RegistroMapper.toEntity(dto.registro()));
        }

        // Set carregador
        if (dto.carregadorId() != null) {
            CarregadorRepository carregadorRepository = new CarregadorRepository();
            fuzil.setCarregador(carregadorRepository.findById(dto.carregadorId()));
        }

        // Set miras
        if (dto.mirasIds() != null && !dto.mirasIds().isEmpty()) {
            MiraRepository miraRepository = new MiraRepository();
            fuzil.setMiras(dto.mirasIds().stream().map(miraRepository::findById).toList());
        }

    return fuzil;
    }

    public static FuzilResponseDTO toResponseDTO(Fuzil fuzil){
        
    return new FuzilResponseDTO(
        fuzil.getId(),
        fuzil.getNome(),
        fuzil.getMarca(),
        fuzil.getModelo(),
        fuzil.getPreco(),
        fuzil.getQuantidadeDisponivel(),
        fuzil.isAtiva(),
        fuzil.getCalibres().stream().map(Calibre::getId).toList(),
        fuzil.getFornecedor() != null ? fuzil.getFornecedor().getId() : null,
        fuzil.getModoDisparo().name(),
        fuzil.getAlcanceEfetivo(),
        fuzil.isPossuiTrilhoTatico(),
        fuzil.getRegistro() != null ? RegistroMapper.toResponseDTO(fuzil.getRegistro()) : null,
        fuzil.getCarregador() != null ? fuzil.getCarregador().getModelo() : null,
        fuzil.getMiras().stream().map(Mira::getId).toList()
    );
    }
    public static FuzilResponseEcommerceDTO toResponseEcommerceDTO(Fuzil fuzil){
        
    return new FuzilResponseEcommerceDTO(
        // 🔹 Arma
        fuzil.getId(),
        fuzil.getNome(),
        fuzil.getMarca(),
        fuzil.getModelo(),
        fuzil.getPreco(),
        fuzil.getQuantidadeDisponivel(),
        fuzil.getCalibres().stream().map(Calibre::getNome).toList(),
        // 🔹 Fuzil
        fuzil.getModoDisparo().name(),
        fuzil.getAlcanceEfetivo(),
        fuzil.isPossuiTrilhoTatico(),
        fuzil.getRegistro() != null ? fuzil.getRegistro().getNumeroSerie() : null,
        fuzil.getCarregador() != null ? fuzil.getCarregador().getModelo() : null,
        fuzil.getMiras().stream().map(Mira::getModelo).toList()
    );
    }
}