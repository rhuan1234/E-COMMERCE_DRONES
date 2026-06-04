package armas;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
@TestSecurity(user = "admin", roles = {"ADMIN"})
class MiraHolograficaControllerTest {

    private static final String TEMPLATE = """
        {
          "modelo": "%s",
          "marca": "%s",
          "aumentoMaximo": %d,
          "alcanceLaser": %d,
          "visaoNoturna": %b
        }
        """;

    @Test
    void testCreateEndpoint() {
        String modelo = "Mira Create";
        String marca = "Marca Create";
        int aumentoMaximo = 5;
        int alcanceLaser = 250;
        boolean visaoNoturna = true;

        given()
                .contentType(ContentType.JSON)
                .body(String.format(TEMPLATE,
                        modelo,
                        marca,
                        aumentoMaximo,
                        alcanceLaser,
                        visaoNoturna))
        .when()
                .post("/miras-holograficas/admin")
        .then()
                .statusCode(201)
                .body("id", notNullValue())
                .body("modelo", is(modelo))
                .body("marca", is(marca))
                .body("aumentoMaximo", is(aumentoMaximo))
                .body("alcanceLaser", is(alcanceLaser))
                .body("visaoNoturna", is(visaoNoturna));
    }

    @Test
    void testFindAllEndpoint() {
        Long id = createMira(
                "Mira FindAll",
                "Marca FindAll",
                4,
                200,
                false
        );

        given()
        .when()
                .get("/miras-holograficas/admin")
        .then()
                .statusCode(200)
                .body("size()", greaterThanOrEqualTo(1))
                .body("id", hasItem(id.intValue()));
    }

    @Test
    void testFindByIdEndpoint() {
        Long id = createMira(
                "Mira FindById",
                "Marca FindById",
                6,
                300,
                true
        );

        given()
                .pathParam("id", id)
        .when()
                .get("/miras-holograficas/admin/{id}")
        .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("modelo", is("Mira FindById"));
    }

    @Test
    void testFindByModeloEndpoint() {
        String modelo = "Mira FindByModelo";

        createMira(
                modelo,
                "Marca FindByModelo",
                3,
                180,
                false
        );

        given()
                .pathParam("modelo", modelo)
        .when()
                .get("/miras-holograficas/modelos/{modelo}")
        .then()
                .statusCode(200)
                .body("modelo", is(modelo))
                .body("marca", is("Marca FindByModelo"));
    }

    @Test
    void testUpdateEndpoint() {
        Long id = createMira(
                "Mira Update",
                "Marca Original",
                7,
                320,
                true
        );

        String updatedJson = String.format(
                TEMPLATE,
                "Mira Atualizada",
                "Marca Atualizada",
                8,
                350,
                false
        );

        given()
                .contentType(ContentType.JSON)
                .body(updatedJson)
                .pathParam("id", id)
        .when()
                .put("/miras-holograficas/admin/{id}")
        .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("modelo", is("Mira Atualizada"))
                .body("marca", is("Marca Atualizada"))
                .body("aumentoMaximo", is(8))
                .body("alcanceLaser", is(350))
                .body("visaoNoturna", is(false));
    }

    @Test
    void testDeleteEndpoint() {
        Long id = createMira(
                "Mira Delete",
                "Marca Delete",
                2,
                120,
                true
        );

        given()
                .pathParam("id", id)
        .when()
                .delete("/miras-holograficas/admin/{id}")
        .then()
                .statusCode(204);

        given()
                .pathParam("id", id)
        .when()
                .get("/miras-holograficas/admin/{id}")
        .then()
                .statusCode(anyOf(is(404), is(422), is(500)));
    }

    @Test
    void testFindByIdInexistente() {
        given()
                .pathParam("id", 999999L)
        .when()
                .get("/miras-holograficas/admin/{id}")
        .then()
                .statusCode(anyOf(is(404), is(422)));
    }

    @Test
    void testFindByModeloInexistente() {
        given()
                .pathParam("modelo", "MODELO_INEXISTENTE")
        .when()
                .get("/miras-holograficas/modelos/{modelo}")
        .then()
                .statusCode(anyOf(is(404), is(422)));
    }

    @Test
    void testUpdateInexistente() {

        String body = String.format(
                TEMPLATE,
                "Teste",
                "Marca Teste",
                5,
                200,
                true
        );

        given()
                .contentType(ContentType.JSON)
                .body(body)
                .pathParam("id", 999999L)
        .when()
                .put("/miras-holograficas/admin/{id}")
        .then()
                .statusCode(anyOf(is(404), is(422)));
    }

    @Test
    void testDeleteInexistente() {
        given()
                .pathParam("id", 999999L)
        .when()
                .delete("/miras-holograficas/admin/{id}")
        .then()
                .statusCode(anyOf(is(404), is(422)));
    }

    private Long createMira(
            String modelo,
            String marca,
            int aumentoMaximo,
            int alcanceLaser,
            boolean visaoNoturna) {

        return given()
                .contentType(ContentType.JSON)
                .body(String.format(
                        TEMPLATE,
                        modelo,
                        marca,
                        aumentoMaximo,
                        alcanceLaser,
                        visaoNoturna))
        .when()
                .post("/miras-holograficas/admin")
        .then()
                .statusCode(201)
                .extract()
                .jsonPath()
                .getLong("id");
    }
}