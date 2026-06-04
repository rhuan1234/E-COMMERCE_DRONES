package armas;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class CarregadorControllerTest {

    private static final String TEMPLATE = "{\n" +
            "  \"modelo\": \"%s\",\n" +
            "  \"qtdMunicao\": %d,\n" +
            "  \"marca\": \"%s\"\n" +
            "}";

    @Test
    void testCreateEndpoint() {
        String modelo = "Modelo Create";
        int qtdMunicao = 30;
        String marca = "Marca Create";

        given()
                .contentType(ContentType.JSON)
                .body(String.format(TEMPLATE, modelo, qtdMunicao, marca))
                .when().post("/carregadores")
                .then()
                .statusCode(201)
                .body("id", notNullValue())
                .body("modelo", is(modelo))
                .body("qtdMunicao", is(qtdMunicao))
                .body("marca", is(marca));
    }

    @Test
    void testFindAllEndpoint() {
        Long id = createCarregador("Modelo FindAll", 10, "Marca FindAll");

        given()
                .when().get("/carregadores")
                .then()
                .statusCode(200)
                .body("size()", greaterThanOrEqualTo(1))
                .body("id", hasItem(id.intValue()));
    }

    @Test
    void testFindByIdEndpoint() {
        Long id = createCarregador("Modelo FindById", 20, "Marca FindById");

        given()
                .pathParam("id", id)
                .when().get("/carregadores/{id}")
                .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("modelo", is("Modelo FindById"));
    }

    @Test
    void testFindByModeloEndpoint() {
        String modelo = "Modelo FindByModelo";
        createCarregador(modelo, 15, "Marca FindByModelo");

        given()
                .pathParam("modelo", modelo)
                .when().get("/carregadores/modelo/{modelo}")
                .then()
                .statusCode(200)
                .body("modelo", is(modelo))
                .body("marca", is("Marca FindByModelo"));
    }

    @Test
    void testUpdateEndpoint() {
        Long id = createCarregador("Modelo Update", 25, "Marca Original");
        String updatedModelo = "Modelo Atualizado";
        int updatedQtdMunicao = 40;
        String updatedMarca = "Marca Atualizada";
        String updatedJson = String.format(TEMPLATE, updatedModelo, updatedQtdMunicao, updatedMarca);

        given()
                .contentType(ContentType.JSON)
                .body(updatedJson)
                .pathParam("id", id)
                .when().put("/carregadores/{id}")
                .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("modelo", is(updatedModelo))
                .body("qtdMunicao", is(updatedQtdMunicao))
                .body("marca", is(updatedMarca));
    }

    @Test
    void testDeleteEndpoint() {
        Long id = createCarregador("Modelo Delete", 50, "Marca Delete");

        given()
                .pathParam("id", id)
                .when().delete("/carregadores/{id}")
                .then()
                .statusCode(204);

        given()
                .pathParam("id", id)
                .when().get("/carregadores/{id}")
                .then()
                .statusCode(anyOf(is(404), is(500)));
    }

    private Long createCarregador(String modelo, int qtdMunicao, String marca) {
        return given()
                .contentType(ContentType.JSON)
                .body(String.format(TEMPLATE, modelo, qtdMunicao, marca))
                .when().post("/carregadores")
                .then()
                .statusCode(201)
                .extract()
                .jsonPath().getLong("id");
    }
}
