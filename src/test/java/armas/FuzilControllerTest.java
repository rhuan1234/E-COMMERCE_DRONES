package armas;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class FuzilControllerTest {

    private static final String TEMPLATE = "{\n" +
            "  \"nome\": \"%s\",\n" +
            "  \"marca\": \"%s\",\n" +
            "  \"modelo\": \"%s\",\n" +
            "  \"preco\": %s,\n" +
            "  \"ativa\": %b,\n" +
            "  \"calibres\": [],\n" +
            "  \"modoDisparo\": \"%s\",\n" +
            "  \"capacidadeCarregador\": %d,\n" +
            "  \"alcanceEfetivo\": %s,\n" +
            "  \"possuiTrilhoTatico\": %b\n" +
            "}";

    @Test
    void testCreateEndpoint() {
        String nome = "Fuzil Create";

        given()
                .contentType(ContentType.JSON)
                .body(String.format(TEMPLATE, nome, "Marca", "Modelo", 3500.0, true, "Semiautomatico", 30, 850.0, true))
                .when().post("/fuzis")
                .then()
                .statusCode(201)
                .body("id", notNullValue())
                .body("nome", is(nome))
                .body("modoDisparo", is("SEMIAUTOMATICO"));
    }

    @Test
    void testFindAllEndpoint() {
        Long id = createFuzil("Fuzil FindAll");

        given()
                .when().get("/fuzis")
                .then()
                .statusCode(200)
                .body("id", hasItem(id.intValue()));
    }

    @Test
    void testFindByIdEndpoint() {
        Long id = createFuzil("Fuzil FindById");

        given()
                .pathParam("id", id)
                .when().get("/fuzis/{id}")
                .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("nome", is("Fuzil FindById"));
    }

    @Test
    void testFindByNomeEndpoint() {
        String nome = "Fuzil FindByNome";
        createFuzil(nome);

        given()
                .pathParam("nome", nome)
                .when().get("/fuzis/nome/{nome}")
                .then()
                .statusCode(200)
                .body("nome", is(nome));
    }

    @Test
    void testUpdateEndpoint() {
        Long id = createFuzil("Fuzil Update");

        String updatedNome = "Fuzil Atualizado";

        String updatedJson = String.format(TEMPLATE,
                updatedNome,
                "Marca Atualizada",
                "Modelo Atualizado",
                3650.0,
                true,
                "Automatico",
                35,
                920.0,
                false
        );

        given()
                .contentType(ContentType.JSON)
                .body(updatedJson)
                .pathParam("id", id)
                .when().put("/fuzis/{id}")
                .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("nome", is(updatedNome))
                .body("modoDisparo", is("AUTOMATICO"));
    }

    @Test
    void testUpdateEndpointNotFound() {
        String updatedJson = String.format(TEMPLATE,
                "Qualquer",
                "Marca",
                "Modelo",
                1000.0,
                true,
                "Automatico",
                30,
                800.0,
                true
        );

        given()
                .contentType(ContentType.JSON)
                .body(updatedJson)
                .pathParam("id", 999L)
                .when().put("/fuzis/{id}")
                .then()
                .statusCode(404)
                .contentType("application/problem+json")
                .body("title", is("Not Found"))
                .body("status", is(404))
                .body("detail", is("Fuzil not found"));
    }

    @Test
    void testDeleteEndpoint() {
        Long id = createFuzil("Fuzil Delete");

        given()
                .pathParam("id", id)
                .when().delete("/fuzis/{id}")
                .then()
                .statusCode(204);

        given()
                .pathParam("id", id)
                .when().get("/fuzis/{id}")
                .then()
                .statusCode(404)
                .contentType("application/problem+json")
                .body("title", is("Not Found"))
                .body("status", is(404))
                .body("detail", is("Fuzil not found"));
    }

    private Long createFuzil(String nome) {
        return given()
                .contentType(ContentType.JSON)
                .body(String.format(TEMPLATE,
                        nome,
                        "Marca",
                        "Modelo",
                        3000.0,
                        true,
                        "Semiautomatico",
                        30,
                        800.0,
                        true
                ))
                .when().post("/fuzis")
                .then()
                .statusCode(201)
                .extract()
                .jsonPath().getLong("id");
    }
}