package drones.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import drones.exception.UnauthorizedException;
import drones.exception.ValidationException;
import drones.model.usuario.Perfil;
import drones.services.KeycloakIdentityProvider.KeycloakTokenClaims;
import drones.services.KeycloakIdentityProvider.KeycloakTokenResult;

class KeycloakHttpClientTest {

    private HttpServer server;
    private KeycloakHttpClient client;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final AtomicReference<String> lastTokenForm = new AtomicReference<>();
    private final AtomicReference<String> lastLogoutForm = new AtomicReference<>();
    private final AtomicBoolean failRoleAssignment = new AtomicBoolean(false);
    private final AtomicBoolean userDeleted = new AtomicBoolean(false);
    private final AtomicBoolean passwordResetCalled = new AtomicBoolean(false);
    private final AtomicBoolean conflictOnCreate = new AtomicBoolean(false);

    @BeforeEach
    void iniciarServidor() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);

        server.createContext("/realms/drones/protocol/openid-connect/token", exchange -> {
            String body = readBody(exchange);
            lastTokenForm.set(body);
            if (body.contains("password=errada")) {
                respondJson(exchange, 401, "{\"error\":\"invalid_grant\"}");
                return;
            }
            String jwt = fakeJwt("kc-user-1", "cliente", "cliente@example.com", "CLIENTE");
            respondJson(exchange, 200, """
                    {
                      "access_token": "%s",
                      "refresh_token": "rt-123",
                      "expires_in": 1800,
                      "token_type": "Bearer"
                    }
                    """.formatted(jwt));
        });

        server.createContext("/realms/drones/protocol/openid-connect/logout", exchange -> {
            lastLogoutForm.set(readBody(exchange));
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
        });

        server.createContext("/admin/realms/drones/users", exchange -> {
            String path = exchange.getRequestURI().getPath();
            String method = exchange.getRequestMethod();

            if ("POST".equals(method) && path.equals("/admin/realms/drones/users")) {
                if (conflictOnCreate.get()) {
                    respondJson(exchange, 409, "{\"errorMessage\":\"User exists\"}");
                    return;
                }
                exchange.getResponseHeaders().add("Location", "http://localhost/admin/realms/drones/users/kc-created-99");
                exchange.sendResponseHeaders(201, -1);
                exchange.close();
                return;
            }

            if ("POST".equals(method) && path.endsWith("/role-mappings/realm")) {
                if (failRoleAssignment.get()) {
                    respondJson(exchange, 500, "{\"error\":\"role failure\"}");
                    return;
                }
                exchange.sendResponseHeaders(204, -1);
                exchange.close();
                return;
            }

            if ("DELETE".equals(method) && path.endsWith("/kc-created-99")) {
                userDeleted.set(true);
                exchange.sendResponseHeaders(204, -1);
                exchange.close();
                return;
            }

            if ("PUT".equals(method) && path.endsWith("/reset-password")) {
                passwordResetCalled.set(true);
                exchange.sendResponseHeaders(204, -1);
                exchange.close();
                return;
            }

            respondJson(exchange, 404, "{}");
        });

        server.createContext("/admin/realms/drones/roles/CLIENTE", exchange ->
                respondJson(exchange, 200, "{\"id\":\"role-1\",\"name\":\"CLIENTE\"}"));

        server.start();
        String baseUrl = "http://127.0.0.1:" + server.getAddress().getPort();
        client = new KeycloakHttpClient(
                HttpClient.newHttpClient(),
                objectMapper,
                baseUrl,
                "drones",
                "drones-backend",
                "secret-dev"
        );
    }

    @AfterEach
    void pararServidor() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void deveAutenticarExtrairClaimsERealizarLogout() {
        KeycloakTokenResult result = client.authenticate("cliente", "123456");
        assertEquals("rt-123", result.refreshToken());
        assertTrue(lastTokenForm.get().contains("grant_type=password"));

        KeycloakTokenClaims claims = client.extractClaims(result.accessToken());
        assertEquals("kc-user-1", claims.keycloakId());
        assertEquals("cliente", claims.username());
        assertTrue(claims.roles().contains("CLIENTE"));

        client.logout("rt-123");
        assertTrue(lastLogoutForm.get().contains("refresh_token=rt-123"));
    }

    @Test
    void deveLancarUnauthorizedQuandoKeycloakRecusarCredenciais() {
        assertThrows(UnauthorizedException.class, () -> client.authenticate("cliente", "errada"));
        assertFalse(client.verifyCredentials("cliente", "errada"));
    }

    @Test
    void deveCriarUsuarioAtribuirRoleERealizarResetDeSenha() {
        String keycloakId = client.createUser("novo", "novo@example.com", "123456", "Novo Usuario", Perfil.CLIENTE);
        assertEquals("kc-created-99", keycloakId);

        client.updatePassword(keycloakId, "novaSenha123");
        assertTrue(passwordResetCalled.get());
    }

    @Test
    void deveCompensarExclusaoSeAtribuicaoDeRoleFalharELancarValidationEmConflito() {
        failRoleAssignment.set(true);
        assertThrows(RuntimeException.class, () ->
                client.createUser("novo", "novo@example.com", "123456", null, Perfil.CLIENTE));
        assertTrue(userDeleted.get());

        conflictOnCreate.set(true);
        assertThrows(ValidationException.class, () ->
                client.createUser("duplicado", "dup@example.com", "123456", null, Perfil.CLIENTE));
    }

    private static String readBody(HttpExchange exchange) throws IOException {
        return new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
    }

    private static void respondJson(HttpExchange exchange, int status, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream out = exchange.getResponseBody()) {
            out.write(bytes);
        }
    }

    private static String fakeJwt(String sub, String username, String email, String role) {
        String header = Base64.getUrlEncoder().withoutPadding()
                .encodeToString("{\"alg\":\"RS256\"}".getBytes(StandardCharsets.UTF_8));
        String payloadJson = """
                {"sub":"%s","preferred_username":"%s","email":"%s","realm_access":{"roles":["%s"]}}
                """.formatted(sub, username, email, role);
        String payload = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));
        return header + "." + payload + ".sig";
    }
}
