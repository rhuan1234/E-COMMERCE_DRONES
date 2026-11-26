package drones.services;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import drones.exception.UnauthorizedException;
import drones.exception.ValidationException;
import drones.model.usuario.Perfil;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response.Status;

@ApplicationScoped
public class KeycloakHttpClient implements KeycloakIdentityProvider {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String serverUrl;
    private final String realm;
    private final String clientId;
    private final String clientSecret;

    private final Object adminTokenLock = new Object();
    private volatile String cachedAdminToken;
    private volatile Instant adminTokenExpiresAt = Instant.EPOCH;

    @Inject
    public KeycloakHttpClient(
            ObjectMapper objectMapper,
            @ConfigProperty(name = "app.keycloak.server-url") String serverUrl,
            @ConfigProperty(name = "app.keycloak.realm") String realm,
            @ConfigProperty(name = "app.keycloak.client-id") String clientId,
            @ConfigProperty(name = "app.keycloak.client-secret") String clientSecret) {
        this(
                HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build(),
                objectMapper,
                serverUrl,
                realm,
                clientId,
                clientSecret
        );
    }

    KeycloakHttpClient(
            HttpClient httpClient,
            ObjectMapper objectMapper,
            String serverUrl,
            String realm,
            String clientId,
            String clientSecret) {
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
        this.serverUrl = trimTrailingSlash(serverUrl);
        this.realm = realm;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    @Override
    public KeycloakTokenResult authenticate(String login, String password) {
        Map<String, String> form = new LinkedHashMap<>();
        form.put("grant_type", "password");
        form.put("client_id", clientId);
        if (clientSecret != null && !clientSecret.isBlank()) {
            form.put("client_secret", clientSecret);
        }
        form.put("username", login);
        form.put("password", password);
        form.put("scope", "openid profile email");

        HttpResponse<String> response = postForm(tokenEndpoint(), form);
        if (response.statusCode() == 400 || response.statusCode() == 401) {
            throw new UnauthorizedException("Login ou senha inválidos");
        }
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new WebApplicationException("Erro ao autenticar no provedor de identidade", Status.BAD_GATEWAY);
        }
        return parseTokenResponse(response.body());
    }

    @Override
    public KeycloakTokenResult refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new UnauthorizedException("Sessão expirada. Faça login novamente.");
        }

        Map<String, String> form = new LinkedHashMap<>();
        form.put("grant_type", "refresh_token");
        form.put("client_id", clientId);
        if (clientSecret != null && !clientSecret.isBlank()) {
            form.put("client_secret", clientSecret);
        }
        form.put("refresh_token", refreshToken);

        HttpResponse<String> response = postForm(tokenEndpoint(), form);
        if (response.statusCode() == 400 || response.statusCode() == 401) {
            throw new UnauthorizedException("Sessão expirada. Faça login novamente.");
        }
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new WebApplicationException("Erro ao renovar sessão no provedor de identidade", Status.BAD_GATEWAY);
        }
        return parseTokenResponse(response.body());
    }

    @Override
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }

        Map<String, String> form = new LinkedHashMap<>();
        form.put("client_id", clientId);
        if (clientSecret != null && !clientSecret.isBlank()) {
            form.put("client_secret", clientSecret);
        }
        form.put("refresh_token", refreshToken);

        HttpResponse<String> response = postForm(logoutEndpoint(), form);
        if (response.statusCode() != 200 && response.statusCode() != 204 && response.statusCode() != 400) {
            throw new WebApplicationException("Erro ao encerrar sessão no provedor de identidade", Status.BAD_GATEWAY);
        }
    }

    @Override
    public void logoutUserSessions(String keycloakId) {
        if (keycloakId == null || keycloakId.isBlank()) {
            return;
        }
        HttpResponse<String> response = sendAdminRequest(
                "POST",
                adminRealmUrl() + "/users/" + encodePath(keycloakId) + "/logout",
                ""
        );
        if (response.statusCode() != 200 && response.statusCode() != 204 && response.statusCode() != 404) {
            throw new WebApplicationException("Erro ao encerrar sessões do usuário no provedor de identidade", Status.BAD_GATEWAY);
        }
    }

    @Override
    public String createUser(String username, String email, String password, String fullName, Perfil perfil) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("username", username);
        payload.put("email", email);
        payload.put("enabled", true);
        payload.put("emailVerified", true);

        if (fullName != null && !fullName.isBlank()) {
            String[] parts = fullName.trim().split("\\s+", 2);
            payload.put("firstName", parts[0]);
            if (parts.length > 1) {
                payload.put("lastName", parts[1]);
            }
        }

        if (password != null && !password.isBlank()) {
            payload.put("credentials", List.of(Map.of(
                    "type", "password",
                    "value", password,
                    "temporary", false
            )));
        }

        HttpResponse<String> response = sendAdminRequest(
                "POST",
                adminRealmUrl() + "/users",
                writeJson(payload)
        );

        if (response.statusCode() == 409) {
            throw new ValidationException("Login ou email já cadastrado no provedor de identidade", "login");
        }
        if (response.statusCode() != 201) {
            throw new WebApplicationException("Erro ao cadastrar usuário no provedor de identidade", Status.BAD_GATEWAY);
        }

        String keycloakId = extractUserIdFromLocation(response)
                .or(() -> findUserIdByUsername(username))
                .orElseThrow(() -> new WebApplicationException(
                        "Não foi possível obter o identificador do usuário no provedor de identidade",
                        Status.BAD_GATEWAY
                ));

        try {
            assignRealmRole(keycloakId, perfil != null ? perfil : Perfil.CLIENTE);
        } catch (RuntimeException ex) {
            try {
                deleteUser(keycloakId);
            } catch (RuntimeException ignored) {
                // Melhor esforço de compensação
            }
            throw ex;
        }

        return keycloakId;
    }

    @Override
    public void updatePassword(String keycloakId, String newPassword) {
        if (keycloakId == null || keycloakId.isBlank()) {
            throw new ValidationException("Usuário não vinculado ao provedor de identidade");
        }
        Map<String, Object> payload = Map.of(
                "type", "password",
                "value", newPassword,
                "temporary", false
        );

        HttpResponse<String> response = sendAdminRequest(
                "PUT",
                adminRealmUrl() + "/users/" + encodePath(keycloakId) + "/reset-password",
                writeJson(payload)
        );

        if (response.statusCode() == 400) {
            throw new ValidationException("A nova senha não atende aos requisitos do provedor de identidade", "novaSenha");
        }
        if (response.statusCode() != 204 && response.statusCode() != 200) {
            throw new WebApplicationException("Erro ao atualizar senha no provedor de identidade", Status.BAD_GATEWAY);
        }
    }

    @Override
    public boolean verifyCredentials(String username, String password) {
        try {
            KeycloakTokenResult result = authenticate(username, password);
            try {
                logout(result.refreshToken());
            } catch (RuntimeException ignored) {
                // Token temporário de verificação
            }
            return true;
        } catch (UnauthorizedException ex) {
            return false;
        }
    }

    @Override
    public void disableUser(String keycloakId) {
        if (keycloakId == null || keycloakId.isBlank()) {
            return;
        }
        HttpResponse<String> response = sendAdminRequest(
                "PUT",
                adminRealmUrl() + "/users/" + encodePath(keycloakId),
                writeJson(Map.of("enabled", false))
        );
        if (response.statusCode() != 204 && response.statusCode() != 200 && response.statusCode() != 404) {
            throw new WebApplicationException("Erro ao desativar usuário no provedor de identidade", Status.BAD_GATEWAY);
        }
    }

    @Override
    public void deleteUser(String keycloakId) {
        if (keycloakId == null || keycloakId.isBlank()) {
            return;
        }
        HttpResponse<String> response = sendAdminRequest(
                "DELETE",
                adminRealmUrl() + "/users/" + encodePath(keycloakId),
                null
        );
        if (response.statusCode() != 204 && response.statusCode() != 200 && response.statusCode() != 404) {
            throw new WebApplicationException("Erro ao remover usuário no provedor de identidade", Status.BAD_GATEWAY);
        }
    }

    @Override
    public void updateUserProfile(String keycloakId, String fullName, String email) {
        if (keycloakId == null || keycloakId.isBlank()) {
            return;
        }
        Map<String, Object> payload = new LinkedHashMap<>();
        if (email != null && !email.isBlank()) {
            payload.put("email", email);
        }
        if (fullName != null && !fullName.isBlank()) {
            String[] parts = fullName.trim().split("\\s+", 2);
            payload.put("firstName", parts[0]);
            payload.put("lastName", parts.length > 1 ? parts[1] : "");
        }
        if (payload.isEmpty()) {
            return;
        }
        HttpResponse<String> response = sendAdminRequest(
                "PUT",
                adminRealmUrl() + "/users/" + encodePath(keycloakId),
                writeJson(payload)
        );
        if (response.statusCode() != 204 && response.statusCode() != 200 && response.statusCode() != 404) {
            throw new WebApplicationException("Erro ao atualizar perfil no provedor de identidade", Status.BAD_GATEWAY);
        }
    }

    @Override
    public Optional<String> findUserIdByUsername(String username) {
        if (username == null || username.isBlank()) {
            return Optional.empty();
        }
        HttpResponse<String> response = sendAdminRequest(
                "GET",
                adminRealmUrl() + "/users?username=" + encodeQuery(username) + "&exact=true",
                null
        );
        if (response.statusCode() != 200) {
            return Optional.empty();
        }
        JsonNode root = readJson(response.body());
        if (root.isArray() && !root.isEmpty()) {
            String id = root.get(0).path("id").asText(null);
            return Optional.ofNullable(id);
        }
        return Optional.empty();
    }

    @Override
    public KeycloakTokenClaims extractClaims(String accessToken) {
        if (accessToken == null || accessToken.isBlank()) {
            throw new UnauthorizedException("Token de acesso ausente");
        }
        String[] parts = accessToken.split("\\.");
        if (parts.length < 2) {
            throw new UnauthorizedException("Token JWT inválido");
        }
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
            JsonNode claims = objectMapper.readTree(decoded);
            String keycloakId = textOrNull(claims, "sub");
            String username = Optional.ofNullable(textOrNull(claims, "preferred_username"))
                    .or(() -> Optional.ofNullable(textOrNull(claims, "upn")))
                    .orElse(keycloakId);
            String email = textOrNull(claims, "email");
            String fullName = textOrNull(claims, "name");

            Set<String> roles = new LinkedHashSet<>();
            JsonNode realmRoles = claims.path("realm_access").path("roles");
            if (realmRoles.isArray()) {
                realmRoles.forEach(node -> {
                    if (node.isTextual()) {
                        roles.add(node.asText());
                    }
                });
            }
            JsonNode groups = claims.path("groups");
            if (groups.isArray()) {
                groups.forEach(node -> {
                    if (node.isTextual()) {
                        roles.add(node.asText());
                    }
                });
            }
            return new KeycloakTokenClaims(keycloakId, username, email, fullName, Set.copyOf(roles));
        } catch (IllegalArgumentException | IOException ex) {
            throw new UnauthorizedException("Token JWT inválido");
        }
    }

    private void assignRealmRole(String keycloakId, Perfil perfil) {
        HttpResponse<String> roleResponse = sendAdminRequest(
                "GET",
                adminRealmUrl() + "/roles/" + encodePath(perfil.name()),
                null
        );
        if (roleResponse.statusCode() != 200) {
            throw new WebApplicationException("Role '" + perfil.name() + "' não encontrada no Keycloak", Status.BAD_GATEWAY);
        }

        JsonNode roleNode = readJson(roleResponse.body());
        HttpResponse<String> assignResponse = sendAdminRequest(
                "POST",
                adminRealmUrl() + "/users/" + encodePath(keycloakId) + "/role-mappings/realm",
                writeJson(List.of(roleNode))
        );
        if (assignResponse.statusCode() != 204 && assignResponse.statusCode() != 200) {
            throw new WebApplicationException("Erro ao atribuir papel ao usuário no Keycloak", Status.BAD_GATEWAY);
        }
    }

    private String getAdminAccessToken() {
        String currentToken = cachedAdminToken;
        if (currentToken != null && Instant.now().isBefore(adminTokenExpiresAt)) {
            return currentToken;
        }
        synchronized (adminTokenLock) {
            if (cachedAdminToken != null && Instant.now().isBefore(adminTokenExpiresAt)) {
                return cachedAdminToken;
            }
            Map<String, String> form = new LinkedHashMap<>();
            form.put("grant_type", "client_credentials");
            form.put("client_id", clientId);
            if (clientSecret != null && !clientSecret.isBlank()) {
                form.put("client_secret", clientSecret);
            }

            HttpResponse<String> response = postForm(tokenEndpoint(), form);
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new WebApplicationException(
                        "Erro ao autenticar serviço backend na Admin API do Keycloak",
                        Status.BAD_GATEWAY
                );
            }

            JsonNode body = readJson(response.body());
            String accessToken = body.path("access_token").asText("");
            long expiresIn = body.path("expires_in").asLong(60L);
            if (accessToken.isBlank()) {
                throw new WebApplicationException("Token administrativo vazio retornado pelo Keycloak", Status.BAD_GATEWAY);
            }
            cachedAdminToken = accessToken;
            long ttlSegundos = Math.max(10L, expiresIn - 30L);
            adminTokenExpiresAt = Instant.now().plusSeconds(ttlSegundos);
            return accessToken;
        }
    }

    private HttpResponse<String> sendAdminRequest(String method, String url, String jsonBody) {
        HttpResponse<String> response = executeAdminHttp(method, url, jsonBody, getAdminAccessToken());
        if (response.statusCode() == 401) {
            synchronized (adminTokenLock) {
                cachedAdminToken = null;
                adminTokenExpiresAt = Instant.EPOCH;
            }
            response = executeAdminHttp(method, url, jsonBody, getAdminAccessToken());
        }
        return response;
    }

    private HttpResponse<String> executeAdminHttp(String method, String url, String jsonBody, String adminToken) {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(10))
                .header("Authorization", "Bearer " + adminToken)
                .header("Accept", "application/json");

        if (jsonBody != null) {
            builder.header("Content-Type", "application/json");
            builder.method(method, HttpRequest.BodyPublishers.ofString(jsonBody));
        } else {
            builder.method(method, HttpRequest.BodyPublishers.noBody());
        }

        try {
            return httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new WebApplicationException("Comunicação com Keycloak interrompida", Status.BAD_GATEWAY);
        } catch (IOException ex) {
            throw new WebApplicationException("Provedor de identidade Keycloak indisponível", Status.BAD_GATEWAY);
        }
    }

    private HttpResponse<String> postForm(String url, Map<String, String> form) {
        String body = form.entrySet().stream()
                .map(entry -> encodeQuery(entry.getKey()) + "=" + encodeQuery(entry.getValue()))
                .collect(Collectors.joining("&"));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(10))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        try {
            return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new WebApplicationException("Comunicação com Keycloak interrompida", Status.BAD_GATEWAY);
        } catch (IOException ex) {
            throw new WebApplicationException("Provedor de identidade Keycloak indisponível", Status.BAD_GATEWAY);
        }
    }

    private KeycloakTokenResult parseTokenResponse(String responseBody) {
        JsonNode json = readJson(responseBody);
        String accessToken = json.path("access_token").asText("");
        String refreshToken = textOrNull(json, "refresh_token");
        long expiresIn = json.path("expires_in").asLong(0L);
        String tokenType = json.path("token_type").asText("Bearer");

        if (accessToken.isBlank()) {
            throw new WebApplicationException("Token inválido retornado pelo Keycloak", Status.BAD_GATEWAY);
        }
        return new KeycloakTokenResult(accessToken, refreshToken, expiresIn > 0 ? expiresIn : null, tokenType);
    }

    private Optional<String> extractUserIdFromLocation(HttpResponse<?> response) {
        return response.headers().firstValue("Location")
                .map(loc -> {
                    int idx = loc.lastIndexOf('/');
                    return idx >= 0 && idx + 1 < loc.length() ? loc.substring(idx + 1) : null;
                })
                .filter(id -> !id.isBlank());
    }

    private JsonNode readJson(String body) {
        try {
            return objectMapper.readTree(body);
        } catch (JsonProcessingException ex) {
            throw new WebApplicationException("Resposta JSON inválida do Keycloak", Status.BAD_GATEWAY);
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Erro ao serializar payload para o Keycloak", ex);
        }
    }

    private String tokenEndpoint() {
        return serverUrl + "/realms/" + encodePath(realm) + "/protocol/openid-connect/token";
    }

    private String logoutEndpoint() {
        return serverUrl + "/realms/" + encodePath(realm) + "/protocol/openid-connect/logout";
    }

    private String adminRealmUrl() {
        return serverUrl + "/admin/realms/" + encodePath(realm);
    }

    private static String textOrNull(JsonNode node, String field) {
        JsonNode child = node.get(field);
        return child != null && child.isTextual() && !child.asText().isBlank() ? child.asText() : null;
    }

    private static String trimTrailingSlash(String value) {
        if (value == null) {
            return "";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private static String encodePath(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private static String encodeQuery(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }
}
