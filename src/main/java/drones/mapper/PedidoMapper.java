package drones.mapper;

import drones.dto.pedidos.ItemPedidoRequestDTO;
import drones.dto.pedidos.ItemPedidoResponseDTO;
import drones.dto.pedidos.PedidoRequestDTO;
import drones.dto.pedidos.PedidoResponseAnaliseAdminDTO;
import drones.dto.pedidos.PedidoResponseDTO;
import drones.model.pedido.ItemPedido;
import drones.model.pedido.Pedido;
import drones.repository.DroneRepository;

public class PedidoMapper {

    public static Pedido toEntity(PedidoRequestDTO dto) {
        Pedido pedido = new Pedido();

        if (dto.itens() != null && !dto.itens().isEmpty()) {
            DroneRepository droneRepository = new DroneRepository();
            pedido.setItens(
                dto.itens().stream()
                    .map(itemDto -> toItemEntity(itemDto, pedido, droneRepository))
                    .toList()
                    .stream()
                    .collect(java.util.stream.Collectors.toList())
            );
        }

        return pedido;
    }

    public static ItemPedido toItemEntity(ItemPedidoRequestDTO dto, Pedido pedido, DroneRepository droneRepository) {
        ItemPedido item = new ItemPedido();
        item.setQuantidade(dto.quantidade());
        item.setPedido(pedido);
        
        if (dto.droneId() != null) {
            item.setDrone(droneRepository.findById(dto.droneId()));
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
            item.getDrone() != null ? item.getDrone().getId() : null,
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
