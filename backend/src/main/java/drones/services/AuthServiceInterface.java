package drones.services;

import drones.dto.auth.AuthRequestDTO;
import drones.dto.auth.AuthResponseDTO;
import drones.dto.auth.AuthUserResponseDTO;
import drones.dto.auth.LogoutRequestDTO;
import drones.dto.auth.RefreshTokenRequestDTO;

public interface AuthServiceInterface {
    AuthResponseDTO login(AuthRequestDTO dto);
    AuthResponseDTO refresh(RefreshTokenRequestDTO dto);
    AuthUserResponseDTO me();
    void logout(LogoutRequestDTO dto);
}
