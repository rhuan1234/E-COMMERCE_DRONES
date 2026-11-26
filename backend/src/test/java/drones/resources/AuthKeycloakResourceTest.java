package drones.resources;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import drones.model.usuario.Usuario;
import drones.repository.UsuarioRepository;
import drones.services.InMemoryKeycloakIdentityProvider;
import io.quarkus.narayana.jta.QuarkusTransaction;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import jakarta.inject.Inject;

@QuarkusTest
class AuthKeycloakResourceTest {

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    InMemoryKeycloakIdentityProvider keycloakProvider;

    @AfterEach
    void limparUsuariosExtras() {
        QuarkusTransaction.requiringNew().run(() -> {
            usuarioRepository.find("id > 2").list().forEach(usuarioRepository::delete);
            Usuario cliente = usuarioRepository.findById(2L);
            if (cliente != null) {
                cliente.setAtivo(true);
            }
        });
        keycloakProvider.reset();
    }

    @Test
    void deveAutenticarClienteERenovarEEncerrarSessaoViaKeycloak() {
        String refreshToken = given()
                .contentType(ContentType.JSON)
                .body(Map.of("login", "cliente", "senha", "123456"))
        .when()
                .post("/auth/login")
        .then()
                .statusCode(200)
                .body("token", notNullValue())
                .body("tipo", equalTo("Bearer"))
                .body("refreshToken", notNullValue())
                .body("usuario.login", equalTo("cliente"))
                .body("usuario.perfil", equalTo("CLIENTE"))
                .body("usuario.roles", hasItem("CLIENTE"))
                .extract()
                .path("refreshToken");

        String novoRefreshToken = given()
                .contentType(ContentType.JSON)
                .body(Map.of("refreshToken", refreshToken))
        .when()
                .post("/auth/refresh")
        .then()
                .statusCode(200)
                .body("token", notNullValue())
                .body("refreshToken", notNullValue())
                .body("usuario.login", equalTo("cliente"))
                .extract()
                .path("refreshToken");

        given()
                .contentType(ContentType.JSON)
                .body(Map.of("refreshToken", novoRefreshToken))
        .when()
                .post("/auth/logout")
        .then()
                .statusCode(204);

        given()
                .contentType(ContentType.JSON)
                .body(Map.of("refreshToken", novoRefreshToken))
        .when()
                .post("/auth/refresh")
        .then()
                .statusCode(401);
    }

    @Test
    void deveRetornar401QuandoCredenciaisForemInvalidas() {
        given()
                .contentType(ContentType.JSON)
                .body(Map.of("login", "cliente", "senha", "senha-errada"))
        .when()
                .post("/auth/login")
        .then()
                .statusCode(401)
                .contentType(containsString("application/problem+json"));
    }

    @Test
    void deveCadastrarClienteNoKeycloakENoBancoSemArmazenarSenhaERealizarLogin() {
        given()
                .contentType(ContentType.JSON)
                .body(Map.of(
                        "login", "novocliente",
                        "senha", "segredo123",
                        "email", "novocliente@example.com"
                ))
        .when()
                .post("/clientes")
        .then()
                .statusCode(201)
                .body("login", equalTo("novocliente"))
                .body("email", equalTo("novocliente@example.com"));

        Usuario salvo = usuarioRepository.findByLogin("novocliente").orElseThrow();
        assertNotNull(salvo.getKeycloakId());
        assertTrue(keycloakProvider.findMockUserByUsername("novocliente").isPresent());

        given()
                .contentType(ContentType.JSON)
                .body(Map.of("login", "novocliente", "senha", "segredo123"))
        .when()
                .post("/auth/login")
        .then()
                .statusCode(200)
                .body("usuario.login", equalTo("novocliente"))
                .body("usuario.perfil", equalTo("CLIENTE"));
    }

    @Test
    void deveRetornarDadosDoUsuarioEmAuthMeOu401SemAutenticacao() {
        given()
        .when()
                .get("/auth/me")
        .then()
                .statusCode(401)
                .contentType(containsString("application/problem+json"));
    }

    @Test
    @TestSecurity(user = "cliente", roles = "CLIENTE")
    void deveRetornarUsuarioAutenticadoEmAuthMe() {
        given()
        .when()
                .get("/auth/me")
        .then()
                .statusCode(200)
                .body("login", equalTo("cliente"))
                .body("email", equalTo("cliente@example.com"))
                .body("perfil", equalTo("CLIENTE"))
                .body("roles", hasItem("CLIENTE"));
    }

    @Test
    @TestSecurity(user = "cliente", roles = "CLIENTE")
    void deveRetornar403AoAcessarEndpointAdminComPerfilCliente() {
        given()
                .contentType(ContentType.JSON)
                .body(Map.of(
                        "login", "adminnovo",
                        "senha", "segredo123",
                        "email", "adminnovo@example.com",
                        "perfil", "ADMIN"
                ))
        .when()
                .post("/usuarios/admin")
        .then()
                .statusCode(403)
                .contentType(containsString("application/problem+json"));
    }

    @Test
    @TestSecurity(user = "rhuan", roles = "ADMIN")
    void deveCriarEDesativarAdminNoKeycloakENoBanco() {
        Number idNumero = given()
                .contentType(ContentType.JSON)
                .body(Map.of(
                        "login", "adminnovo",
                        "senha", "segredo123",
                        "email", "adminnovo@example.com",
                        "perfil", "ADMIN"
                ))
        .when()
                .post("/usuarios/admin")
        .then()
                .statusCode(201)
                .body("login", equalTo("adminnovo"))
                .body("perfil", equalTo("ADMIN"))
                .extract()
                .path("id");

        Usuario adminCriado = usuarioRepository.findById(idNumero.longValue());
        assertNotNull(adminCriado);
        String keycloakId = adminCriado.getKeycloakId();
        assertNotNull(keycloakId);
        assertEquals(true, keycloakProvider.findMockUserById(keycloakId).orElseThrow().isEnabled());

        given()
        .when()
                .delete("/usuarios/admin/{id}", idNumero.longValue())
        .then()
                .statusCode(204);

        assertFalse(keycloakProvider.findMockUserById(keycloakId).orElseThrow().isEnabled());
    }

    @Test
    @TestSecurity(user = "trocasenha", roles = "CLIENTE")
    void deveAlterarSenhaNoKeycloakViaBackend() {
        given()
                .contentType(ContentType.JSON)
                .body(Map.of(
                        "login", "trocasenha",
                        "senha", "senhaAntiga1",
                        "email", "trocasenha@example.com"
                ))
        .when()
                .post("/clientes")
        .then()
                .statusCode(201);

        given()
                .contentType(ContentType.JSON)
                .body(Map.of(
                        "senhaAtual", "senhaErrada",
                        "novaSenha", "senhaNova123"
                ))
        .when()
                .patch("/clientes/senha")
        .then()
                .statusCode(422);

        given()
                .contentType(ContentType.JSON)
                .body(Map.of(
                        "senhaAtual", "senhaAntiga1",
                        "novaSenha", "senhaNova123"
                ))
        .when()
                .patch("/clientes/senha")
        .then()
                .statusCode(200);

        given()
                .contentType(ContentType.JSON)
                .body(Map.of("login", "trocasenha", "senha", "senhaNova123"))
        .when()
                .post("/auth/login")
        .then()
                .statusCode(200)
                .body("usuario.login", equalTo("trocasenha"));

        given()
                .contentType(ContentType.JSON)
                .body(Map.of("login", "trocasenha", "senha", "senhaAntiga1"))
        .when()
                .post("/auth/login")
        .then()
                .statusCode(401);
    }
}
