package armas.services;

import armas.dto.auth.AuthRequestDTO;
import armas.dto.auth.AuthResponseDTO;

public interface AuthServiceInterface {
    AuthResponseDTO login(AuthRequestDTO dto);
}