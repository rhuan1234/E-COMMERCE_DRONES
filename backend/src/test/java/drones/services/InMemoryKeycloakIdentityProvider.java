package drones.services;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import drones.exception.UnauthorizedException;
import drones.exception.ValidationException;
import drones.model.usuario.Perfil;
import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Alternative;
import jakarta.inject.Inject;

@Alternative
@Priority(1)
@ApplicationScoped
public class InMemoryKeycloakIdentityProvider implements KeycloakIdentityProvider {

    public static final class MockUser {
        final String keycloakId;
        final String username;
        String email;
        String fullName;
        String password;
        final Perfil perfil;
        boolean enabled;

        MockUser(String keycloakId, String username, String email, String fullName, String password, Perfil perfil, boolean enabled) {
            this.keycloakId = keycloakId;
            this.username = username;
            this.email = email;
            this.fullName = fullName;
            this.password = password;
            this.perfil = perfil;
            this.enabled = enabled;
        }

        public boolean isEnabled() {
            return enabled;
        }

        public Perfil getPerfil() {
            return perfil;
        }
    }

    @Inject
    ObjectMapper objectMapper;

    private final Map<String, MockUser> usersById = new ConcurrentHashMap<>();
    private final Map<String, String> refreshTokenToUserId = new ConcurrentHashMap<>();

    public InMemoryKeycloakIdentityProvider() {
        reset();
    }

    public synchronized void reset() {
        usersById.clear();
        refreshTokenToUserId.clear();
        usersById.put(
                "11111111-1111-4111-8111-111111111111",
                new MockUser(
                        "11111111-1111-4111-8111-111111111111",
                        "rhuan",
                        "rhuan@example.com",
                        "Rhuan Administrador",
                        "123456",
                        Perfil.ADMIN,
                        true
                )
        );
        usersById.put(
                "22222222-2222-4222-8222-222222222222",
                new MockUser(
                        "22222222-2222-4222-8222-222222222222",
                        "cliente",
                        "cliente@example.com",
                        "Lucas Silva",
                        "123456",
                        Perfil.CLIENTE,
                        true
                )
        );
    }

    public Optional<MockUser> findMockUserByUsername(String username) {
        return usersById.values().stream()
                .filter(u -> u.username.equals(username))
                .findFirst();
    }

    public Optional<MockUser> findMockUserById(String keycloakId) {
        return Optional.ofNullable(usersById.get(keycloakId));
    }

    @Override
    public KeycloakTokenResult authenticate(String login, String password) {
        MockUser user = findMockUserByUsername(login)
                .filter(u -> u.enabled && u.password.equals(password))
                .orElseThrow(() -> new UnauthorizedException("Login ou senha inválidos"));

        return issueTokens(user);
    }

    @Override
    public KeycloakTokenResult refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new UnauthorizedException("Sessão expirada. Faça login novamente.");
        }
        String userId = refreshTokenToUserId.remove(refreshToken);
        if (userId == null) {
            throw new UnauthorizedException("Sessão expirada. Faça login novamente.");
        }
        MockUser user = usersById.get(userId);
        if (user == null || !user.enabled) {
            throw new UnauthorizedException("Sessão expirada. Faça login novamente.");
        }
        return issueTokens(user);
    }

    @Override
    public void logout(String refreshToken) {
        if (refreshToken != null) {
            refreshTokenToUserId.remove(refreshToken);
        }
    }

    @Override
    public void logoutUserSessions(String keycloakId) {
        refreshTokenToUserId.entrySet().removeIf(entry -> entry.getValue().equals(keycloakId));
    }

    @Override
    public synchronized String createUser(String username, String email, String password, String fullName, Perfil perfil) {
        boolean exists = usersById.values().stream()
                .anyMatch(u -> u.username.equals(username) || (email != null && email.equals(u.email)));
        if (exists) {
            throw new ValidationException("Login ou email já cadastrado no provedor de identidade", "login");
        }

        String id = UUID.randomUUID().toString();
        usersById.put(id, new MockUser(
                id,
                username,
                email,
                fullName,
                password,
                perfil != null ? perfil : Perfil.CLIENTE,
                true
        ));
        return id;
    }

    @Override
    public void updatePassword(String keycloakId, String newPassword) {
        MockUser user = usersById.get(keycloakId);
        if (user == null) {
            throw new ValidationException("Usuário não encontrado no provedor de identidade");
        }
        user.password = newPassword;
    }

    @Override
    public boolean verifyCredentials(String username, String password) {
        return findMockUserByUsername(username)
                .filter(u -> u.enabled && u.password.equals(password))
                .isPresent();
    }

    @Override
    public void disableUser(String keycloakId) {
        MockUser user = usersById.get(keycloakId);
        if (user != null) {
            user.enabled = false;
        }
    }

    @Override
    public void deleteUser(String keycloakId) {
        usersById.remove(keycloakId);
        logoutUserSessions(keycloakId);
    }

    @Override
    public void updateUserProfile(String keycloakId, String fullName, String email) {
        MockUser user = usersById.get(keycloakId);
        if (user != null) {
            if (fullName != null) {
                user.fullName = fullName;
            }
            if (email != null) {
                user.email = email;
            }
        }
    }

    @Override
    public Optional<String> findUserIdByUsername(String username) {
        return findMockUserByUsername(username).map(u -> u.keycloakId);
    }

    @Override
    public KeycloakTokenClaims extractClaims(String accessToken) {
        if (accessToken == null || accessToken.isBlank()) {
            throw new UnauthorizedException("Token de acesso ausente");
        }
        try {
            String[] parts = accessToken.split("\\.");
            byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
            JsonNode claims = objectMapper.readTree(decoded);
            String sub = claims.path("sub").asText();
            String username = claims.path("preferred_username").asText(sub);
            String email = claims.path("email").isTextual() ? claims.path("email").asText() : null;
            String name = claims.path("name").isTextual() ? claims.path("name").asText() : null;
            Set<String> roles = new java.util.LinkedHashSet<>();
            claims.path("realm_access").path("roles").forEach(n -> roles.add(n.asText()));
            return new KeycloakTokenClaims(sub, username, email, name, Set.copyOf(roles));
        } catch (Exception ex) {
            throw new UnauthorizedException("Token JWT inválido");
        }
    }

    private KeycloakTokenResult issueTokens(MockUser user) {
        long exp = Instant.now().plusSeconds(1800).getEpochSecond();
        Map<String, Object> header = Map.of("alg", "RS256", "typ", "JWT");
        Map<String, Object> payload = new java.util.LinkedHashMap<>();
        payload.put("sub", user.keycloakId);
        payload.put("preferred_username", user.username);
        if (user.email != null) {
            payload.put("email", user.email);
        }
        if (user.fullName != null) {
            payload.put("name", user.fullName);
        }
        payload.put("realm_access", Map.of("roles", Set.of(user.perfil.name())));
        payload.put("exp", exp);

        String accessToken = encodeSegment(header) + "." + encodeSegment(payload) + ".mock-signature";
        String refreshToken = "rt-" + UUID.randomUUID();
        refreshTokenToUserId.put(refreshToken, user.keycloakId);
        return new KeycloakTokenResult(accessToken, refreshToken, 1800L, "Bearer");
    }

    private String encodeSegment(Object obj) {
        try {
            String json = objectMapper.writeValueAsString(obj);
            return Base64.getUrlEncoder().withoutPadding().encodeToString(json.getBytes(StandardCharsets.UTF_8));
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }
}
