package armas;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
@TestSecurity(
        user = "admin",
        roles = "ADMIN")
class CalibreControllerTest {

    private static final String ADMIN_PATH = "/calibres/admin";

    private static final String TEMPLATE = """
        {
            "nome": "%s",
            "marca": "%s"
        }
        """;

    @Test
    void deveCriarCalibreComStatus201() {
        Long id = criarCalibre("Calibre Create", "Marca Create");

        given()
                .pathParam("id", id)
        .when()
                .get(ADMIN_PATH + "/{id}")
        .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("nome", is("Calibre Create"))
                .body("marca", is("Marca Create"));
    }

    @Test
    void deveListarCalibresComStatus200() {
        Long id = criarCalibre("Calibre FindAll", "Marca FindAll");

        given()
        .when()
                .get(ADMIN_PATH)
        .then()
                .statusCode(200)
                .body("size()", greaterThanOrEqualTo(1))
                .body("id", hasItem(id.intValue()));
    }

    @Test
    void deveBuscarCalibrePorIdComStatus200() {
        Long id = criarCalibre("Calibre FindById", "Marca FindById");

        given()
                .pathParam("id", id)
        .when()
                .get(ADMIN_PATH + "/{id}")
        .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("nome", is("Calibre FindById"))
                .body("marca", is("Marca FindById"));
    }

    @Test
    void deveBuscarCalibrePorNomeComStatus200() {
        String nome = "Calibre FindByNome";
        criarCalibre(nome, "Marca FindByNome");

        given()
                .pathParam("nome", nome)
        .when()
                .get("/calibres/nomes/admin/{nome}")
        .then()
                .statusCode(200)
                .body("nome", is(nome))
                .body("marca", is("Marca FindByNome"));
    }

    @Test
    void deveAtualizarCalibreComStatus200() {
        Long id = criarCalibre("Calibre Update", "Marca Original");

        String payloadAtualizado = String.format(
                TEMPLATE,
                "Calibre Atualizado",
                "Marca Atualizada"
        );

        given()
                .contentType(ContentType.JSON)
                .body(payloadAtualizado)
                .pathParam("id", id)
        .when()
                .put(ADMIN_PATH + "/{id}")
        .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("nome", is("Calibre Atualizado"))
                .body("marca", is("Marca Atualizada"));
    }

    @Test
    void deveRemoverCalibreComStatus204() {
        Long id = criarCalibre("Calibre Delete", "Marca Delete");

        given()
                .pathParam("id", id)
        .when()
                .delete(ADMIN_PATH + "/{id}")
        .then()
                .statusCode(204);

        given()
                .pathParam("id", id)
        .when()
                .get(ADMIN_PATH + "/{id}")
        .then()
                .statusCode(404)
                .body("type", is("http://localhost:8080/errors/resource-not-found"))
                .body("status", is(404))
                .body("detail", is("Calibre não encontrado"));
    }

    @Test
    void deveRetornar404AoBuscarCalibreInexistente() {
        given()
                .pathParam("id", 999999L)
        .when()
                .get(ADMIN_PATH + "/{id}")
        .then()
                .statusCode(404);
    }

    @Test
    void deveRetornar422AoBuscarComIdInvalido() {
        given()
                .pathParam("id", 0)
        .when()
                .get(ADMIN_PATH + "/{id}")
        .then()
                .statusCode(422);
    }

    @Test
    void deveRetornar422AoCriarCalibreSemNome() {

        String payload = """
            {
                "nome": "",
                "marca": "Taurus"
            }
            """;

        given()
                .contentType(ContentType.JSON)
                .body(payload)
        .when()
                .post(ADMIN_PATH)
        .then()
                .statusCode(422);
    }

    @Test
    void deveRetornar422AoCriarCalibreSemMarca() {

        String payload = """
            {
                "nome": "5.56 NATO",
                "marca": ""
            }
            """;

        given()
                .contentType(ContentType.JSON)
                .body(payload)
        .when()
                .post(ADMIN_PATH)
        .then()
                .statusCode(422);
    }

    @Test
    void deveRetornar404AoAtualizarCalibreInexistente() {

        String payload = String.format(
                TEMPLATE,
                "Novo Nome",
                "Nova Marca"
        );

        given()
                .contentType(ContentType.JSON)
                .body(payload)
                .pathParam("id", 999999L)
        .when()
                .put(ADMIN_PATH + "/{id}")
        .then()
                .statusCode(404);
    }

    @Test
    void deveRetornar404AoDeletarCalibreInexistente() {

        given()
                .pathParam("id", 999999L)
        .when()
                .delete(ADMIN_PATH + "/{id}")
        .then()
                .statusCode(404);
    }

    private Long criarCalibre(String nome, String marca) {
        return given()
                .contentType(ContentType.JSON)
                .body(String.format(TEMPLATE, nome, marca))
        .when()
                .post(ADMIN_PATH)
        .then()
                .statusCode(201)
                .extract()
                .jsonPath()
                .getLong("id");
    }
}