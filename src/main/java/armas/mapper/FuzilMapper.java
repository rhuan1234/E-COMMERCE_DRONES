package armas.mapper;

import armas.dto.armas.FuzilRequestDTO;
import armas.dto.armas.FuzilResponseDTO;
import armas.model.armas.Calibre;
import armas.model.armas.Fuzil;
import armas.model.armas.ModoDisparo;
import armas.repository.FornecedorRepository;

public class FuzilMapper {
    public static Fuzil toEntity(FuzilRequestDTO dto){
        
        Fuzil fuzil = new Fuzil();

        fuzil.setNome(dto.nome());
        fuzil.setMarca(dto.marca());
        fuzil.setModelo(dto.modelo());
        fuzil.setNumeroSerie(dto.numeroSerie());
        fuzil.setPreco(dto.preco());
        
        fuzil.setAtiva(dto.ativa());
        fuzil.setCalibre(Calibre.fromDescricao(dto.calibre()));
            if(dto.fornecedorId() != null){
                FornecedorRepository fornecedorRepository = new FornecedorRepository();
                if (fornecedorRepository.findById(dto.fornecedorId()) != null) {
                    fuzil.setFornecedor(fornecedorRepository.findById(dto.fornecedorId()));
                } 
    
            }
        // 🔹 campos da Fuzil
        fuzil.setModoDisparo(ModoDisparo.fromDescricao(dto.modoDisparo()));
        fuzil.setCapacidadeCarregador(dto.capacidadeCarregador());
        fuzil.setAlcanceEfetivo(dto.alcanceEfetivo());
        fuzil.setPossuiTrilhoTatico(dto.possuiTrilhoTatico());

    return fuzil;
    }

    public static FuzilResponseDTO toResponseDTO(Fuzil fuzil){
        
    return new FuzilResponseDTO(
        // 🔹 Arma
        fuzil.getId(),
        fuzil.getNome(),
        fuzil.getMarca(),
        fuzil.getModelo(),
        fuzil.getNumeroSerie(),
        fuzil.getPreco(),
        
        fuzil.isAtiva(),
        fuzil.getCalibre().name(),
        fuzil.getFornecedor() != null ? fuzil.getFornecedor().getId() : null,
        fuzil.getRegistro() != null ? fuzil.getRegistro().getId() : null,
        // 🔹 Fuzil
        fuzil.getModoDisparo().name(),
        fuzil.getCapacidadeCarregador(),
        fuzil.getAlcanceEfetivo(),
        fuzil.isPossuiTrilhoTatico()
    );
    }
}