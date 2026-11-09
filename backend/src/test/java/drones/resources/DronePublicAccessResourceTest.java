package drones.resources;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

@QuarkusTest
class DronePublicAccessResourceTest {

    @Test
    void catalogoPodeSerAcessadoSemAutenticacao() {
        given()
                .queryParam("page", 0)
                .queryParam("pageSize", 12)
        .when()
                .get("/drones")
        .then()
                .statusCode(200)
                .body("page", equalTo(0));
    }

    @Test
    void catalogoIgnoraTokenInvalido() {
        given()
                .header("Authorization", "Bearer token-invalido")
                .queryParam("page", 0)
                .queryParam("pageSize", 12)
        .when()
                .get("/drones")
        .then()
                .statusCode(200)
                .body("page", equalTo(0));
    }

    @Test
    void endpointsAdministrativosContinuamProtegidos() {
        given()
        .when()
                .get("/drones/admin")
        .then()
                .statusCode(401);
    }

    @Test
    void avaliacoesDoDroneSaoPublicasEPaginadasEmCincoPorPagina() {
        given()
                .queryParam("page", 0)
        .when()
                .get("/avaliacoes/drone/1")
        .then()
                .statusCode(200)
                .body("pageSize", equalTo(5))
                .body("items[0].nomeCliente", equalTo("Lucas Silva"));
    }
}
