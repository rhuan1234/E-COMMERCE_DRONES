package armas.mapper;
import armas.dto.armas.FuzilResponseEcommerceDTO;
import armas.model.armas.Calibre;
import armas.model.armas.Fuzil;

import armas.model.mira.Mira;


public class FuzilMapperEcommerce {
    

    public static FuzilResponseEcommerceDTO toResponseDTO(Fuzil fuzil){
        
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
