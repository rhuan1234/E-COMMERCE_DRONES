package armas;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
@TestSecurity(user = "admin", roles = {"ADMIN"})
class RedDotControllerTest {

    private static final String TEMPLATE = """
    {
      "modelo": "%s",
      "marca": "%s",
      "aumentoMaximo": %d,
      "niveisBrilho": %d,
      "duracaoBateria": %s
    }
    """;

    @Test
    void testCreateEndpoint() {
        given()
                .contentType(ContentType.JSON)
                .body(String.format(
                        TEMPLATE,
                        "RedDot Create",
                        "Marca Create",
                        3,
                        7,
                        12.5))
                .when()
                .post("/red-dots/admin")
                .then()
                .statusCode(201)
                .body("id", notNullValue())
                .body("modelo", is("RedDot Create"));
    }

    @Test
    void testFindAllEndpoint() {
        Long id = createRedDot(
                "RedDot FindAll",
                "Marca FindAll",
                4,
                8,
                14.0);

        given()
                .when()
                .get("/red-dots/admin")
                .then()
                .statusCode(200)
                .body("id", hasItem(id.intValue()));
    }

    @Test
    void testFindByIdEndpoint() {
        Long id = createRedDot(
                "RedDot FindById",
                "Marca FindById",
                5,
                9,
                10.0);

        given()
                .pathParam("id", id)
                .when()
                .get("/red-dots/admin/{id}")
                .then()
                .statusCode(200)
                .body("id", is(id.intValue()));
    }

    @Test
    void testFindByModeloEndpoint() {
        createRedDot(
                "RedDot Modelo",
                "Marca Modelo",
                6,
                10,
                16.0);

        given()
                .pathParam("modelo", "RedDot Modelo")
                .when()
                .get("/red-dots/admin/modelos/{modelo}")
                .then()
                .statusCode(200)
                .body("modelo", is("RedDot Modelo"));
    }

    @Test
    void testUpdateEndpoint() {
        Long id = createRedDot(
                "RedDot Original",
                "Marca Original",
                2,
                5,
                8.0);

        String body = String.format(
                TEMPLATE,
                "RedDot Atualizado",
                "Marca Atualizada",
                7,
                12,
                18.5);

        given()
                .contentType(ContentType.JSON)
                .body(body)
                .pathParam("id", id)
                .when()
                .put("/red-dots/admin/{id}")
                .then()
                .statusCode(200)
                .body("modelo", is("RedDot Atualizado"));
    }

    @Test
    void testDeleteEndpoint() {
        Long id = createRedDot(
                "RedDot Delete",
                "Marca Delete",
                1,
                4,
                7.0);

        given()
                .pathParam("id", id)
                .when()
                .delete("/red-dots/admin/{id}")
                .then()
                .statusCode(204);
    }

    private Long createRedDot(
            String modelo,
            String marca,
            int aumentoMaximo,
            int niveisBrilho,
            double duracaoBateria) {

        return given()
                .contentType(ContentType.JSON)
                .body(String.format(
                        TEMPLATE,
                        modelo,
                        marca,
                        aumentoMaximo,
                        niveisBrilho,
                        duracaoBateria))
                .when()
                .post("/red-dots/admin")
                .then()
                .statusCode(201)
                .extract()
                .jsonPath()
                .getLong("id");
    }

    @Test
void testFindByIdInexistente() {
    given()
            .pathParam("id", 999999L)
            .when()
            .get("/red-dots/admin/{id}")
            .then()
            .statusCode(anyOf(is(404), is(422)));
}

@Test
void testFindByModeloInexistente() {
    given()
            .pathParam("modelo", "MODELO_INEXISTENTE")
            .when()
            .get("/red-dots/admin/modelos/{modelo}")
            .then()
            .statusCode(anyOf(is(404), is(422)));
}

@Test
void testUpdateInexistente() {

    String body = String.format(
            TEMPLATE,
            "Novo Modelo",
            "Nova Marca",
            5,
            10,
            20.0
    );

    given()
            .contentType(ContentType.JSON)
            .body(body)
            .pathParam("id", 999999L)
            .when()
            .put("/red-dots/admin/{id}")
            .then()
            .statusCode(anyOf(is(404), is(422)));
}

@Test
void testDeleteInexistente() {

    given()
            .pathParam("id", 999999L)
            .when()
            .delete("/red-dots/admin/{id}")
            .then()
            .statusCode(anyOf(is(404), is(422)));
}

@Test
void testCreateComDadosInvalidos() {

    String body = """
        {
            "modelo": "",
            "marca": "",
            "aumentoMaximo": -1,
            "niveisBrilho": -5,
            "duracaoBateria": -10
        }
        """;

    given()
            .contentType(ContentType.JSON)
            .body(body)
            .when()
            .post("/red-dots/admin")
            .then()
            .statusCode(anyOf(is(400), is(422)));
}

@Test
void testUpdateComDadosInvalidos() {

    Long id = createRedDot(
            "Modelo Teste",
            "Marca Teste",
            3,
            5,
            10.0
    );

    String body = """
        {
            "modelo": "",
            "marca": "",
            "aumentoMaximo": -1,
            "niveisBrilho": -5,
            "duracaoBateria": -10
        }
        """;

    given()
            .contentType(ContentType.JSON)
            .body(body)
            .pathParam("id", id)
            .when()
            .put("/red-dots/admin/{id}")
            .then()
            .statusCode(anyOf(is(400), is(422)));
}
}