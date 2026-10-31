package drones.resources;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.quarkus.test.security.jwt.Claim;
import io.quarkus.test.security.jwt.JwtSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import drones.dto.pedidos.ItemPedidoRequestDTO;
import drones.dto.pedidos.PedidoRequestDTO;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * Exemplo de Teste de Integração de API REST utilizando Quarkus, REST Assured e TestSecurity.
 * Demonstra a cobertura dos pilares: Sucesso, Erro, Validações, Autenticação, Autorização e Isolamento.
 */
@QuarkusTest
@DisplayName("Testes de Integração de API - PedidoController")
public class PedidoResourceTest {

    @Nested
    @DisplayName("Cenários de Autenticação e Autorização")
    class Seguranca {

        @Test
        @DisplayName("Deve retornar 401 Unauthorized ao tentar criar pedido sem autenticação")
        void deveRetornar401QuandoNaoAutenticado() {
            PedidoRequestDTO request = new PedidoRequestDTO(List.of(new ItemPedidoRequestDTO(1L, 1)));

            given()
                .contentType(ContentType.JSON)
                .body(request)
            .when()
                .post("/pedidos")
            .then()
                .statusCode(401);
        }

        @Test
        @TestSecurity(user = "cliente", roles = "CLIENTE")
        @DisplayName("Deve retornar 403 Forbidden quando perfil CLIENTE tentar acessar listagem administrativa")
        void deveRetornar403QuandoClienteAcessaRotaAdmin() {
            given()
                .contentType(ContentType.JSON)
            .when()
                .get("/pedidos/admin")
            .then()
                .statusCode(403);
        }

        @Test
        @TestSecurity(user = "rhuan", roles = "ADMIN")
        @DisplayName("Deve permitir acesso com 200 OK quando ADMIN acessar listagem administrativa")
        void devePermitirAcessoAdmin() {
            given()
                .contentType(ContentType.JSON)
            .when()
                .get("/pedidos/admin")
            .then()
                .statusCode(200)
                .body("items", notNullValue());
        }
    }

    @Nested
    @DisplayName("Cenários de Negócio e Validações")
    class RegrasDeNegocio {

        @Test
        @TestSecurity(user = "cliente", roles = "CLIENTE")
        @JwtSecurity(claims = {
            @Claim(key = "id", value = "2"),
            @Claim(key = "email", value = "cliente@example.com"),
            @Claim(key = "sub", value = "cliente")
        })
        @DisplayName("Deve criar pedido com sucesso (201 Created), snapshot de endereço e congelamento de preço")
        void deveCriarPedidoComSucesso() {
            // Criação com Drone 1 (DJI Mini 4 Pro, com estoque no import.sql)
            PedidoRequestDTO request = new PedidoRequestDTO(List.of(new ItemPedidoRequestDTO(1L, 1)));

            given()
                .contentType(ContentType.JSON)
                .body(request)
            .when()
                .post("/pedidos")
            .then()
                .statusCode(201)
                .body("id", notNullValue())
                .body("statusPedido", equalTo("PENDENTE"))
                .body("valorTotal", greaterThan(0.0f))
                .body("ruaEntrega", notNullValue()) // Valida snapshot de endereço
                .body("itens", hasSize(1))
                .body("itens[0].precoUnitario", greaterThan(0.0f)); // Valida congelamento de preço
        }

        @Test
        @TestSecurity(user = "cliente", roles = "CLIENTE")
        @JwtSecurity(claims = {
            @Claim(key = "id", value = "2"),
            @Claim(key = "email", value = "cliente@example.com"),
            @Claim(key = "sub", value = "cliente")
        })
        @DisplayName("Deve retornar 400 Bad Request quando solicitar quantidade superior ao estoque")
        void deveFalharQuandoEstoqueInsuficiente() {
            PedidoRequestDTO request = new PedidoRequestDTO(List.of(new ItemPedidoRequestDTO(1L, 999999)));

            given()
                .contentType(ContentType.JSON)
                .body(request)
            .when()
                .post("/pedidos")
            .then()
                .statusCode(400);
        }

        @Test
        @TestSecurity(user = "cliente", roles = "CLIENTE")
        @DisplayName("Deve retornar 400 Bad Request quando lista de itens for vazia")
        void deveFalharQuandoListaItensVazia() {
            PedidoRequestDTO request = new PedidoRequestDTO(List.of());

            given()
                .contentType(ContentType.JSON)
                .body(request)
            .when()
                .post("/pedidos")
            .then()
                .statusCode(400);
        }
    }

    @Nested
    @DisplayName("Cenários de Isolamento de Tenants / Usuários")
    class Isolamento {

        @Test
        @TestSecurity(user = "outro_cliente", roles = "CLIENTE")
        @JwtSecurity(claims = {
            @Claim(key = "id", value = "99"),
            @Claim(key = "sub", value = "outro_cliente")
        })
        @DisplayName("Não deve permitir que um cliente visualize pedido pertencente a outro cliente (404/403)")
        void naoDeveAcessarPedidoDeOutroCliente() {
            // Supondo que o pedido 1 pertença ao usuário 'cliente' (id 2)
            given()
                .contentType(ContentType.JSON)
            .when()
                .get("/pedidos/1")
            .then()
                .statusCode(anyOf(is(404), is(403)));
        }
    }
}
