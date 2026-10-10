package drones.mapper;

import java.util.Collections;

import drones.dto.promocao.PromocaoRequestDTO;
import drones.dto.promocao.PromocaoResponseDTO;
import drones.model.promocao.Promocao;

public final class PromocaoMapper {
    private PromocaoMapper() {
    }

    public static Promocao toEntity(PromocaoRequestDTO dto) {
        Promocao promocao = new Promocao();
        promocao.setNome(dto.nome());
        promocao.setPercentualDesconto(dto.percentualDesconto());
        promocao.setDataInicio(dto.dataInicio());
        promocao.setDataFim(dto.dataFim());
        return promocao;
    }

    public static PromocaoResponseDTO toResponseDTO(Promocao promocao) {
        return new PromocaoResponseDTO(
                promocao.getId(),
                promocao.getNome(),
                promocao.getPercentualDesconto(),
                promocao.getDataInicio(),
                promocao.getDataFim(),
                promocao.getDrones() == null
                        ? Collections.emptyList()
                        : promocao.getDrones().stream().map(drone -> drone.getId()).toList());
    }
}