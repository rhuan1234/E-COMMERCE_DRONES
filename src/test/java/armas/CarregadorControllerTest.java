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
class CarregadorControllerTest {

    private static final String ADMIN_PATH = "/carregadores/admin";

    private static final String TEMPLATE = "{\n" +
            "  \"modelo\": \"%s\",\n" +
            "  \"qtdMunicao\": %d,\n" +
            "  \"marca\": \"%s\"\n" +
            "}";

    @Test
    void deveCriarCarregadorComStatus201() {
        Long id = criarCarregador(
                "Modelo Create",
                30,
                "Marca Create");

        given()
                .pathParam("id", id)
                .when().get(ADMIN_PATH + "/{id}")
                .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("modelo", is("Modelo Create"))
                .body("qtdMunicao", is(30))
                .body("marca", is("Marca Create"));
    }

    @Test
    void deveListarCarregadoresComStatus200() {
        Long id = criarCarregador(
                "Modelo FindAll",
                10,
                "Marca FindAll");

        given()
                .when().get(ADMIN_PATH)
                .then()
                .statusCode(200)
                .body("size()", greaterThanOrEqualTo(1))
                .body("id", hasItem(id.intValue()));
    }

    @Test
    void deveBuscarCarregadorPorIdComStatus200() {
        Long id = criarCarregador(
                "Modelo FindById",
                20,
                "Marca FindById");

        given()
                .pathParam("id", id)
                .when().get(ADMIN_PATH + "/{id}")
                .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("modelo", is("Modelo FindById"))
                .body("qtdMunicao", is(20))
                .body("marca", is("Marca FindById"));
    }

    @Test
    void deveBuscarCarregadorPorModeloComStatus200() {
        String modelo = "Modelo FindByModelo";

        criarCarregador(
                modelo,
                15,
                "Marca FindByModelo");

        given()
                .pathParam("modelo", modelo)
                .when().get("/carregadores/modelos/admin/{modelo}")
                .then()
                .statusCode(200)
                .body("modelo", is(modelo))
                .body("qtdMunicao", is(15))
                .body("marca", is("Marca FindByModelo"));
    }

    @Test
    void deveAtualizarCarregadorComStatus200() {
        Long id = criarCarregador(
                "Modelo Update",
                25,
                "Marca Original");

        String payloadAtualizado = String.format(
                TEMPLATE,
                "Modelo Atualizado",
                40,
                "Marca Atualizada");

        given()
                .contentType(ContentType.JSON)
                .body(payloadAtualizado)
                .pathParam("id", id)
                .when().put(ADMIN_PATH + "/{id}")
                .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("modelo", is("Modelo Atualizado"))
                .body("qtdMunicao", is(40))
                .body("marca", is("Marca Atualizada"));
    }

    @Test
    void deveRemoverCarregadorComStatus204() {
        Long id = criarCarregador(
                "Modelo Delete",
                50,
                "Marca Delete");

        given()
                .pathParam("id", id)
                .when().delete(ADMIN_PATH + "/{id}")
                .then()
                .statusCode(204);

        given()
                .pathParam("id", id)
                .when().get(ADMIN_PATH + "/{id}")
                .then()
                .statusCode(404)
                .body("detail", is("Carregador não encontrado"));
    }

    private Long criarCarregador(
            String modelo,
            int qtdMunicao,
            String marca) {

        return given()
                .contentType(ContentType.JSON)
                .body(String.format(
                        TEMPLATE,
                        modelo,
                        qtdMunicao,
                        marca))
                .when().post(ADMIN_PATH)
                .then()
                .statusCode(201)
                .extract()
                .jsonPath()
                .getLong("id");
    }

    @Test
void deveRetornar404AoBuscarCarregadorInexistente() {
    given()
            .pathParam("id", 999999L)
            .when().get(ADMIN_PATH + "/{id}")
            .then()
            .statusCode(404)
            .body("detail", is("Carregador não encontrado"));
}

@Test
void deveRetornar404AoAtualizarCarregadorInexistente() {
    String payload = String.format(
            TEMPLATE,
            "Modelo Teste",
            30,
            "Marca Teste");

    given()
            .contentType(ContentType.JSON)
            .body(payload)
            .pathParam("id", 999999L)
            .when().put(ADMIN_PATH + "/{id}")
            .then()
            .statusCode(404)
            .body("detail", is("Carregador não encontrado"));
}

@Test
void deveRetornar404AoRemoverCarregadorInexistente() {
    given()
            .pathParam("id", 999999L)
            .when().delete(ADMIN_PATH + "/{id}")
            .then()
            .statusCode(404)
            .body("detail", is("Carregador não encontrado"));
}

@Test
void deveRetornar422AoBuscarComIdInvalido() {
    given()
            .pathParam("id", 0)
            .when().get(ADMIN_PATH + "/{id}")
            .then()
            .statusCode(422)
            .body("detail", is("Id do carregador inválido"));
}

@Test
void deveRetornar422AoAtualizarComIdInvalido() {
    String payload = String.format(
            TEMPLATE,
            "Modelo Teste",
            30,
            "Marca Teste");

    given()
            .contentType(ContentType.JSON)
            .body(payload)
            .pathParam("id", 0)
            .when().put(ADMIN_PATH + "/{id}")
            .then()
            .statusCode(422)
            .body("detail", is("Id do carregador inválido"));
}

@Test
void deveRetornar422AoRemoverComIdInvalido() {
    given()
            .pathParam("id", 0)
            .when().delete(ADMIN_PATH + "/{id}")
            .then()
            .statusCode(422)
            .body("detail", is("Id do carregador inválido"));
}
}