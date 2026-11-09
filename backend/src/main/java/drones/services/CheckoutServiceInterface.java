package drones.services;

import drones.dto.pedidos.CheckoutRequestDTO;
import drones.dto.pedidos.CheckoutResponseDTO;

public interface CheckoutServiceInterface {
    CheckoutResponseDTO finalizar(CheckoutRequestDTO dados, String login);
}
