package armas;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class MiraHolograficaControllerTest {

    private static final String TEMPLATE = "{\n" +
            "  \"modelo\": \"%s\",\n" +
            "  \"marca\": \"%s\",\n" +
            "  \"aumentoMaximo\": %d,\n" +
            "  \"alcanceLaser\": %d,\n" +
            "  \"visaoNoturna\": %b\n" +
            "}";

    @Test
    void testCreateEndpoint() {
        String modelo = "Mira Create";
        String marca = "Marca Create";
        int aumentoMaximo = 5;
        int alcanceLaser = 250;
        boolean visaoNoturna = true;

        given()
                .contentType(ContentType.JSON)
                .body(String.format(TEMPLATE, modelo, marca, aumentoMaximo, alcanceLaser, visaoNoturna))
                .when().post("/miras-holograficas")
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
        Long id = createMira("Mira FindAll", "Marca FindAll", 4, 200, false);

        given()
                .when().get("/miras-holograficas")
                .then()
                .statusCode(200)
                .body("size()", greaterThanOrEqualTo(1))
                .body("id", hasItem(id.intValue()));
    }

    @Test
    void testFindByIdEndpoint() {
        Long id = createMira("Mira FindById", "Marca FindById", 6, 300, true);

        given()
                .pathParam("id", id)
                .when().get("/miras-holograficas/{id}")
                .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("modelo", is("Mira FindById"));
    }

    @Test
    void testFindByModeloEndpoint() {
        String modelo = "Mira FindByModelo";
        createMira(modelo, "Marca FindByModelo", 3, 180, false);

        given()
                .pathParam("modelo", modelo)
                .when().get("/miras-holograficas/modelo/{modelo}")
                .then()
                .statusCode(200)
                .body("modelo", is(modelo))
                .body("marca", is("Marca FindByModelo"));
    }

    @Test
    void testUpdateEndpoint() {
        Long id = createMira("Mira Update", "Marca Original", 7, 320, true);
        String updatedModelo = "Mira Atualizada";
        String updatedMarca = "Marca Atualizada";
        int updatedAumento = 8;
        int updatedAlcance = 350;
        boolean updatedVisao = false;
        String updatedJson = String.format(TEMPLATE, updatedModelo, updatedMarca, updatedAumento, updatedAlcance, updatedVisao);

        given()
                .contentType(ContentType.JSON)
                .body(updatedJson)
                .pathParam("id", id)
                .when().put("/miras-holograficas/{id}")
                .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("modelo", is(updatedModelo))
                .body("marca", is(updatedMarca))
                .body("aumentoMaximo", is(updatedAumento))
                .body("alcanceLaser", is(updatedAlcance))
                .body("visaoNoturna", is(updatedVisao));
    }

    @Test
    void testDeleteEndpoint() {
        Long id = createMira("Mira Delete", "Marca Delete", 2, 120, true);

        given()
                .pathParam("id", id)
                .when().delete("/miras-holograficas/{id}")
                .then()
                .statusCode(204);

        given()
                .pathParam("id", id)
                .when().get("/miras-holograficas/{id}")
                .then()
                .statusCode(anyOf(is(404), is(500)));
    }

    private Long createMira(String modelo, String marca, int aumentoMaximo, int alcanceLaser, boolean visaoNoturna) {
        return given()
                .contentType(ContentType.JSON)
                .body(String.format(TEMPLATE, modelo, marca, aumentoMaximo, alcanceLaser, visaoNoturna))
                .when().post("/miras-holograficas")
                .then()
                .statusCode(201)
                .extract()
                .jsonPath().getLong("id");
    }
}
