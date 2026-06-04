package armas;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class RedDotControllerTest {

    private static final String TEMPLATE = "{\n" +
            "  \"modelo\": \"%s\",\n" +
            "  \"marca\": \"%s\",\n" +
            "  \"aumentoMaximo\": %d,\n" +
            "  \"niveisBrilho\": %d,\n" +
            "  \"duracaoBateria\": %s\n" +
            "}";

    @Test
    void testCreateEndpoint() {
        String modelo = "RedDot Create";
        String marca = "Marca Create";
        int aumentoMaximo = 3;
        int niveisBrilho = 7;
        double duracaoBateria = 12.5;

        given()
                .contentType(ContentType.JSON)
                .body(String.format(TEMPLATE, modelo, marca, aumentoMaximo, niveisBrilho, duracaoBateria))
                .when().post("/red-dots")
                .then()
                .statusCode(201)
                .body("id", notNullValue())
                .body("modelo", is(modelo))
                .body("marca", is(marca))
                .body("aumentoMaximo", is(aumentoMaximo))
                .body("niveisBrilho", is(niveisBrilho))
                .body("duracaoBateria", is((float) duracaoBateria));
    }

    @Test
    void testFindAllEndpoint() {
        Long id = createRedDot("RedDot FindAll", "Marca FindAll", 4, 8, 14.0);

        given()
                .when().get("/red-dots")
                .then()
                .statusCode(200)
                .body("size()", greaterThanOrEqualTo(1))
                .body("id", hasItem(id.intValue()));
    }

    @Test
    void testFindByIdEndpoint() {
        Long id = createRedDot("RedDot FindById", "Marca FindById", 5, 9, 10.0);

        given()
                .pathParam("id", id)
                .when().get("/red-dots/{id}")
                .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("modelo", is("RedDot FindById"));
    }

    @Test
    void testFindByModeloEndpoint() {
        String modelo = "RedDot FindByModelo";
        createRedDot(modelo, "Marca FindByModelo", 6, 10, 16.0);

        given()
                .pathParam("modelo", modelo)
                .when().get("/red-dots/modelo/{modelo}")
                .then()
                .statusCode(200)
                .body("modelo", is(modelo))
                .body("marca", is("Marca FindByModelo"));
    }

    @Test
    void testUpdateEndpoint() {
        Long id = createRedDot("RedDot Update", "Marca Original", 2, 5, 8.0);
        String updatedModelo = "RedDot Atualizado";
        String updatedMarca = "Marca Atualizada";
        int updatedAumento = 7;
        int updatedNiveisBrilho = 12;
        double updatedDuracao = 18.5;
        String updatedJson = String.format(TEMPLATE, updatedModelo, updatedMarca, updatedAumento, updatedNiveisBrilho, updatedDuracao);

        given()
                .contentType(ContentType.JSON)
                .body(updatedJson)
                .pathParam("id", id)
                .when().put("/red-dots/{id}")
                .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("modelo", is(updatedModelo))
                .body("marca", is(updatedMarca))
                .body("aumentoMaximo", is(updatedAumento))
                .body("niveisBrilho", is(updatedNiveisBrilho))
                .body("duracaoBateria", is((float) updatedDuracao));
    }

    @Test
    void testDeleteEndpoint() {
        Long id = createRedDot("RedDot Delete", "Marca Delete", 1, 4, 7.0);

        given()
                .pathParam("id", id)
                .when().delete("/red-dots/{id}")
                .then()
                .statusCode(204);

        given()
                .pathParam("id", id)
                .when().get("/red-dots/{id}")
                .then()
                .statusCode(anyOf(is(404), is(500)));
    }

    private Long createRedDot(String modelo, String marca, int aumentoMaximo, int niveisBrilho, double duracaoBateria) {
        return given()
                .contentType(ContentType.JSON)
                .body(String.format(TEMPLATE, modelo, marca, aumentoMaximo, niveisBrilho, duracaoBateria))
                .when().post("/red-dots")
                .then()
                .statusCode(201)
                .extract()
                .jsonPath().getLong("id");
    }
}
