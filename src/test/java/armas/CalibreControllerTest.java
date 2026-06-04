package armas;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class CalibreControllerTest {

    private static final String TEMPLATE = "{\n" +
            "  \"nome\": \"%s\",\n" +
            "  \"marca\": \"%s\"\n" +
            "}";

    @Test
    void testFindAllEndpoint() {
        Long id = createCalibre("Calibre FindAll", "Marca FindAll");

        given()
                .when().get("/calibres")
                .then()
                .statusCode(200)
                .body("size()", greaterThanOrEqualTo(1))
                .body("id", hasItem(id.intValue()));
    }

    @Test
    void testFindByIdEndpoint() {
        Long id = createCalibre("Calibre FindById", "Marca FindById");

        given()
                .pathParam("id", id)
                .when().get("/calibres/{id}")
                .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("nome", is("Calibre FindById"));
    }

    @Test
    void testFindByNomeEndpoint() {
        String nome = "Calibre FindByNome";
        createCalibre(nome, "Marca FindByNome");

        given()
                .pathParam("nome", nome)
                .when().get("/calibres/nome/{nome}")
                .then()
                .statusCode(200)
                .body("nome", is(nome))
                .body("marca", is("Marca FindByNome"));
    }

    @Test
    void testUpdateEndpoint() {
        Long id = createCalibre("Calibre Update", "Marca Original");
        String updatedNome = "Calibre Atualizado";
        String updatedMarca = "Marca Atualizada";
        String updatedJson = String.format(TEMPLATE, updatedNome, updatedMarca);

        given()
                .contentType(ContentType.JSON)
                .body(updatedJson)
                .pathParam("id", id)
                .when().put("/calibres/{id}")
                .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("nome", is(updatedNome))
                .body("marca", is(updatedMarca));
    }

    @Test
    void testDeleteEndpoint() {
        Long id = createCalibre("Calibre Delete", "Marca Delete");

        given()
                .pathParam("id", id)
                .when().delete("/calibres/{id}")
                .then()
                .statusCode(204);

        given()
                .pathParam("id", id)
                .when().get("/calibres/{id}")
                .then()
                .statusCode(404)
                .body("type", is("https://tools.ietf.org/html/rfc7807"))
                .body("title", is("Not Found"))
                .body("status", is(404))
                .body("detail", is("Calibre not found"));
    }

    private Long createCalibre(String nome, String marca) {
        return given()
                .contentType(ContentType.JSON)
                .body(String.format(TEMPLATE, nome, marca))
                .when().post("/calibres")
                .then()
                .statusCode(201)
                .extract()
                .jsonPath().getLong("id");
    }
}
