package drones.services;

import drones.dto.auth.AuthRequestDTO;
import drones.dto.auth.AuthResponseDTO;

public interface AuthServiceInterface {
    AuthResponseDTO login(AuthRequestDTO dto);
}