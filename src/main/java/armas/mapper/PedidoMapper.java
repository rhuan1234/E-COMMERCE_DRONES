package armas.mapper;

import armas.dto.pedidos.ItemPedidoRequestDTO;
import armas.dto.pedidos.ItemPedidoResponseDTO;
import armas.dto.pedidos.PedidoRequestDTO;
import armas.dto.pedidos.PedidoResponseAnaliseAdminDTO;
import armas.dto.pedidos.PedidoResponseDTO;
import armas.model.pedido.ItemPedido;
import armas.model.pedido.Pedido;
import armas.repository.FuzilRepository;

public class PedidoMapper {

    public static Pedido toEntity(PedidoRequestDTO dto) {
        Pedido pedido = new Pedido();

        if (dto.itens() != null && !dto.itens().isEmpty()) {
            FuzilRepository fuzilRepository = new FuzilRepository();
            pedido.setItens(
                dto.itens().stream()
                    .map(itemDto -> toItemEntity(itemDto, pedido, fuzilRepository))
                    .toList()
                    .stream()
                    .collect(java.util.stream.Collectors.toList())
            );
        }

        return pedido;
    }

    public static ItemPedido toItemEntity(ItemPedidoRequestDTO dto, Pedido pedido, FuzilRepository fuzilRepository) {
        ItemPedido item = new ItemPedido();
        item.setQuantidade(dto.quantidade());
        item.setPedido(pedido);
        
        if (dto.fuzilId() != null) {
            item.setFuzil(fuzilRepository.findById(dto.fuzilId()));
        }

        return item;
    }

    public static PedidoResponseDTO toResponseDTO(Pedido pedido) {
        return new PedidoResponseDTO(
            pedido.getId(),
            pedido.getDataPedido(),
            pedido.getValorTotal(),
            pedido.getStatusPedido() != null ? pedido.getStatusPedido().name() : null,
            pedido.getUsuario() != null ? pedido.getUsuario().getId() : null,
            pedido.getItens() != null 
                ? pedido.getItens().stream()
                    .map(PedidoMapper::toItemResponseDTO)
                    .toList()
                : java.util.List.of(),
            pedido.getRuaEntrega(),
            pedido.getBairroEntrega(),
            pedido.getCidadeEntrega(),
            pedido.getEstadoEntrega(),
            pedido.getCepEntrega()
        );
    }

    public static ItemPedidoResponseDTO toItemResponseDTO(ItemPedido item) {
        return new ItemPedidoResponseDTO(
            item.getId(),
            item.getFuzil() != null ? item.getFuzil().getId() : null,
            item.getQuantidade(),
            item.getPrecoUnitario(),
            item.getSubtotal()
        );
    }

    public static PedidoResponseAnaliseAdminDTO toResponseAnaliseAdminDTO(Pedido pedido) {
        return new PedidoResponseAnaliseAdminDTO(
            pedido.getId(),
            pedido.getDataPedido(),
            pedido.getValorTotal(),
            pedido.getStatusPedido() != null ? pedido.getStatusPedido().name() : null, 
            pedido.getItens() != null 
                ? pedido.getItens().stream()
                    .map(PedidoMapper::toItemResponseDTO)
                    .toList()
                : java.util.List.of(),
            pedido.getRuaEntrega(),
            pedido.getBairroEntrega(),
            pedido.getCidadeEntrega(),
            pedido.getEstadoEntrega(),
            pedido.getCepEntrega(),
            pedido.getUsuario() != null ? pedido.getUsuario().getId() : null,
            pedido.getUsuario() != null ? pedido.getUsuario().getCpf() : null,
            pedido.getUsuario() != null ? pedido.getUsuario().getNomeCompleto() : null,
            pedido.getUsuario() != null ? pedido.getUsuario().getRegistroAtirador() : null
        );
}
}
