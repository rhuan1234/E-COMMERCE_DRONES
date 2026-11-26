package drones.services;

import java.util.Optional;
import java.util.Set;

import drones.model.usuario.Perfil;

public interface KeycloakIdentityProvider {

    record KeycloakTokenResult(
        String accessToken,
        String refreshToken,
        Long expiresIn,
        String tokenType
    ) {}

    record KeycloakTokenClaims(
        String keycloakId,
        String username,
        String email,
        String fullName,
        Set<String> roles
    ) {}

    KeycloakTokenResult authenticate(String login, String password);

    KeycloakTokenResult refreshToken(String refreshToken);

    void logout(String refreshToken);

    void logoutUserSessions(String keycloakId);

    String createUser(String username, String email, String password, String fullName, Perfil perfil);

    void updatePassword(String keycloakId, String newPassword);

    boolean verifyCredentials(String username, String password);

    void disableUser(String keycloakId);

    void deleteUser(String keycloakId);

    void updateUserProfile(String keycloakId, String fullName, String email);

    Optional<String> findUserIdByUsername(String username);

    KeycloakTokenClaims extractClaims(String accessToken);
}
