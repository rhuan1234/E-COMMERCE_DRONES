package armas;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
@TestSecurity(
        user = "admin",
        roles = "ADMIN"
)
class FuzilControllerTest {

    private static final String ADMIN_PATH = "/fuzis/admin";

    @Test
    void deveCriarFuzilComStatus201() {

        Long calibreId = criarCalibre();
        Long fornecedorId = criarFornecedor();
        Long carregadorId = criarCarregador();
        Long miraId = criarMira();

        String payload = criarPayloadFuzil(
                "Fuzil Create",
                calibreId,
                fornecedorId,
                carregadorId,
                miraId
        );

        given()
                .contentType(ContentType.JSON)
                .body(payload)
                .when().post(ADMIN_PATH)
                .then()
                .statusCode(201)
                .body("id", notNullValue())
                .body("nome", is("Fuzil Create"));
    }

    @Test
    void deveListarFuzisComStatus200() {

        Long id = criarFuzil("Fuzil FindAll");

        given()
                .when().get(ADMIN_PATH)
                .then()
                .statusCode(200)
                .body("size()", greaterThanOrEqualTo(1))
                .body("id", hasItem(id.intValue()));
    }

    @Test
    void deveBuscarFuzilPorIdComStatus200() {

        Long id = criarFuzil("Fuzil FindById");

        given()
                .pathParam("id", id)
                .when().get(ADMIN_PATH + "/{id}")
                .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("nome", is("Fuzil FindById"));
    }

    @Test
    void deveBuscarFuzilPorNomeComStatus200() {

        String nome = "Fuzil FindByNome";

        criarFuzil(nome);

        given()
                .pathParam("nome", nome)
                .when().get("/fuzis/admin/nomes/{nome}")
                .then()
                .statusCode(200)
                .body("nome", is(nome));
    }

    @Test
    void deveAtualizarFuzilComStatus200() {

        Long id = criarFuzil("Fuzil Original");

        Long calibreId = criarCalibre();
        Long fornecedorId = criarFornecedor();
        Long carregadorId = criarCarregador();
        Long miraId = criarMira();

        String payload = criarPayloadFuzil(
                "Fuzil Atualizado",
                calibreId,
                fornecedorId,
                carregadorId,
                miraId
        );

        given()
                .contentType(ContentType.JSON)
                .body(payload)
                .pathParam("id", id)
                .when().put(ADMIN_PATH + "/{id}")
                .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("nome", is("Fuzil Atualizado"));
    }

    @Test
    void deveRemoverFuzilComStatus204() {

        Long id = criarFuzil("Fuzil Delete");

        given()
                .pathParam("id", id)
                .when().delete(ADMIN_PATH + "/{id}")
                .then()
                .statusCode(204);

        given()
                .pathParam("id", id)
                .when().get(ADMIN_PATH + "/{id}")
                .then()
                .statusCode(422)
                .body("type", equalTo("http://localhost:8080/errors/validation-error"))
                .body("detail", is("Fuzil com id '" + id + "' não encontrado"));
    }

    @Test
    void deveRetornar422AoBuscarFuzilInexistente() {

        given()
                .pathParam("id", 999999L)
                .when().get(ADMIN_PATH + "/{id}")
                .then()
                .statusCode(422)
                .body("type", equalTo("http://localhost:8080/errors/validation-error"))
                .body("detail", is("Fuzil com id '999999' não encontrado"));
    }

    @Test
    void deveRetornar422AoBuscarNomeInexistente() {

        given()
                .pathParam("nome", "INEXISTENTE")
                .when().get("/fuzis/admin/nomes/{nome}")
                .then()
                .statusCode(422)
                .body("type", equalTo("http://localhost:8080/errors/validation-error"))
                .body("detail", is("Fuzil com nome 'INEXISTENTE' não encontrado"));
    }

    @Test
    void deveRetornar422AoAtualizarFuzilInexistente() {

        Long calibreId = criarCalibre();
        Long fornecedorId = criarFornecedor();
        Long carregadorId = criarCarregador();
        Long miraId = criarMira();

        String payload = criarPayloadFuzil(
                "Fuzil Inexistente",
                calibreId,
                fornecedorId,
                carregadorId,
                miraId
        );

        given()
                .contentType(ContentType.JSON)
                .body(payload)
                .pathParam("id", 999999L)
                .when().put(ADMIN_PATH + "/{id}")
                .then()
                .statusCode(422)
                .body("type", equalTo("http://localhost:8080/errors/validation-error"))
                .body("detail", is("Fuzil com id '999999' não encontrado"));
    }

    @Test
    void deveRetornar422AoRemoverFuzilInexistente() {

        given()
                .pathParam("id", 999999L)
                .when().delete(ADMIN_PATH + "/{id}")
                .then()
                .statusCode(422)
                .body("type", equalTo("http://localhost:8080/errors/validation-error"))
                .body("detail", is("Fuzil com id '999999' não encontrado"));
    }

    // ========= HELPERS =========

    private Long criarFuzil(String nome) {

        Long calibreId = criarCalibre();
        Long fornecedorId = criarFornecedor();
        Long carregadorId = criarCarregador();
        Long miraId = criarMira();

        return given()
                .contentType(ContentType.JSON)
                .body(criarPayloadFuzil(
                        nome,
                        calibreId,
                        fornecedorId,
                        carregadorId,
                        miraId
                ))
                .when().post(ADMIN_PATH)
                .then()
                .statusCode(201)
                .extract()
                .jsonPath()
                .getLong("id");
    }

    private String criarPayloadFuzil(
            String nome,
            Long calibreId,
            Long fornecedorId,
            Long carregadorId,
            Long miraId
    ) {

        return """
            {
              "nome":"%s",
              "marca":"Colt",
              "modelo":"M4A1",
              "preco":15000,
              "quantidadeDisponivel":10,
              "ativa":true,
              "calibres":[%d],
              "fornecedorId":%d,
              "modoDisparo":"Automatico",
              "alcanceEfetivo":800,
              "possuiTrilhoTatico":true,
              "registro":{
                 "dataRegistro":"%s",
                 "numeroSerie":"%s"
              },
              "carregadorId":%d,
              "mirasIds":[%d]
            }
            """.formatted(
                nome,
                calibreId,
                fornecedorId,
                LocalDate.now(),
                gerarNumeroSerieUnico(),
                carregadorId,
                miraId
        );
    }

    private String gerarNumeroSerieUnico() {
        return "SERIE" + Math.abs(System.nanoTime());
    }

    private Long criarCalibre() {
        return given()
                .contentType(ContentType.JSON)
                .body("""
                    {
                      "nome":"556",
                      "marca":"CBC"
                    }
                    """)
                .when().post("/calibres/admin")
                .then()
                .statusCode(201)
                .extract()
                .jsonPath()
                .getLong("id");
    }

    private Long criarCarregador() {
        return given()
                .contentType(ContentType.JSON)
                .body("""
                    {
                      "modelo":"PMAG",
                      "qtdMunicao":30,
                      "marca":"Magpul"
                    }
                    """)
                .when().post("/carregadores/admin")
                .then()
                .statusCode(201)
                .extract()
                .jsonPath()
                .getLong("id");
    }

    private Long criarMira() {
        return given()
                .contentType(ContentType.JSON)
                .body("""
                    {
                      "modelo":"EOTech",
                      "marca":"EOTech",
                      "aumentoMaximo":5,
                      "alcanceLaser":100,
                      "visaoNoturna":true
                    }
                    """)
                .when().post("/miras-holograficas/admin")
                .then()
                .statusCode(201)
                .extract()
                .jsonPath()
                .getLong("id");
    }

    private Long criarFornecedor() {

        String cnpj = gerarCnpjValido();
        String email = "fornecedor" + System.nanoTime() + "@teste.com";

        return given()
                .contentType(ContentType.JSON)
                .body("""
                    {
                      "nome":"Fornecedor Teste",
                      "cnpj":"%s",
                      "email":"%s",
                      "telefone":{"numero":"63999999999"},
                      "ativo":true,
                      "endereco":{
                         "rua":"Rua Teste",
                         "bairro":"Centro",
                         "cidade":"Palmas",
                         "estado":"TO",
                         "cep":"77000-000"
                      }
                    }
                    """.formatted(cnpj, email))
                .when().post("/fornecedores/admin")
                .then()
                .statusCode(201)
                .extract()
                .jsonPath()
                .getLong("id");
    }

    private String gerarCnpjValido() {
        String base = String.format("%012d", Math.abs(System.nanoTime()) % 1000000000000L);
        int[] peso1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int[] peso2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};

        int soma = 0;
        for (int i = 0; i < 12; i++) {
            soma += Character.getNumericValue(base.charAt(i)) * peso1[i];
        }
        int digito1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);

        String temp = base + digito1;
        soma = 0;
        for (int i = 0; i < 13; i++) {
            soma += Character.getNumericValue(temp.charAt(i)) * peso2[i];
        }
        int digito2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);

        return temp + digito2;
    }
}