package armas;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
@TestSecurity(user = "admin", roles = "ADMIN")
class FornecedorControllerTest {

    private static final String ADMIN_PATH = "/fornecedores/admin";

    private static final String TEMPLATE = "{\n" +
            "  \"nome\": \"%s\",\n" +
            "  \"cnpj\": \"%s\",\n" +
            "  \"email\": \"%s\",\n" +
            "  \"telefone\": { \"numero\": \"11999999999\" },\n" +
            "  \"ativo\": true,\n" +
            "  \"endereco\": {\n" +
            "    \"rua\": \"Rua Exemplo\",\n" +
            "    \"bairro\": \"Centro\",\n" +
            "    \"cidade\": \"Palmas\",\n" +
            "    \"estado\": \"TO\",\n" +
            "    \"cep\": \"77019508\"\n" +
            "  }\n" +
            "}";

    private String gerarCnpjValido() {
        int[] base = new int[12];

        for (int i = 0; i < 12; i++) {
            base[i] = (int) (Math.random() * 10);
        }

        int[] peso1 = {5,4,3,2,9,8,7,6,5,4,3,2};
        int[] peso2 = {6,5,4,3,2,9,8,7,6,5,4,3,2};

        int soma = 0;
        for (int i = 0; i < 12; i++) {
            soma += base[i] * peso1[i];
        }

        int resto = soma % 11;
        int dig1 = (resto < 2) ? 0 : 11 - resto;

        soma = 0;
        for (int i = 0; i < 12; i++) {
            soma += base[i] * peso2[i];
        }
        soma += dig1 * peso2[12];

        resto = soma % 11;
        int dig2 = (resto < 2) ? 0 : 11 - resto;

        StringBuilder cnpj = new StringBuilder();
        for (int num : base) {
            cnpj.append(num);
        }
        cnpj.append(dig1).append(dig2);

        return cnpj.toString();
    }

    @Test
    void deveCriarFornecedorComStatus201() {
        Long id = criarFornecedor("Fornecedor Create");

        given()
                .pathParam("id", id)
                .when().get(ADMIN_PATH + "/{id}")
                .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("nome", is("Fornecedor Create"));
    }

    @Test
    void deveListarFornecedoresComStatus200() {
        Long id = criarFornecedor("Fornecedor FindAll");

        given()
                .when().get(ADMIN_PATH)
                .then()
                .statusCode(200)
                .body("size()", greaterThanOrEqualTo(1))
                .body("id", hasItem(id.intValue()));
    }

    @Test
    void deveBuscarFornecedorPorIdComStatus200() {
        Long id = criarFornecedor("Fornecedor FindById");

        given()
                .pathParam("id", id)
                .when().get(ADMIN_PATH + "/{id}")
                .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("nome", is("Fornecedor FindById"));
    }

    @Test
    void deveBuscarFornecedorPorNomeComStatus200() {
        String nome = "Fornecedor FindByNome";
        criarFornecedor(nome);

        given()
                .pathParam("nome", nome)
                .when().get(ADMIN_PATH + "/nomes/{nome}")
                .then()
                .statusCode(200)
                .body("nome", is(nome));
    }

    @Test
    void deveAtualizarFornecedorComStatus200() {
        Long id = criarFornecedor("Fornecedor Update");

        String email = "update" + System.nanoTime() + "@teste.com";
        String cnpj = gerarCnpjValido();

        String payloadAtualizado =
                "{\n" +
                "  \"nome\": \"Fornecedor Atualizado\",\n" +
                "  \"cnpj\": \"" + cnpj + "\",\n" +
                "  \"email\": \"" + email + "\",\n" +
                "  \"telefone\": { \"numero\": \"11988888888\" },\n" +
                "  \"ativo\": false,\n" +
                "  \"endereco\": {\n" +
                "    \"rua\": \"Rua Atualizada\",\n" +
                "    \"bairro\": \"Centro\",\n" +
                "    \"cidade\": \"Palmas\",\n" +
                "    \"estado\": \"TO\",\n" +
                "    \"cep\": \"77019508\"\n" +
                "  }\n" +
                "}";

        given()
                .contentType(ContentType.JSON)
                .body(payloadAtualizado)
                .pathParam("id", id)
                .when().put(ADMIN_PATH + "/{id}")
                .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("nome", is("Fornecedor Atualizado"));
    }

    @Test
    void deveRemoverFornecedorComStatus204() {
        Long id = criarFornecedor("Fornecedor Delete");

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
                .body("detail", is("Fornecedor não encontrado"));
    }

    @Test
    void deveRetornar404AoBuscarFornecedorInexistente() {
        given()
                .pathParam("id", 999999L)
                .when().get(ADMIN_PATH + "/{id}")
                .then()
                .statusCode(404)
                .body("detail", is("Fornecedor não encontrado"));
    }

    @Test
    void deveRetornar404AoAtualizarFornecedorInexistente() {

        String payload = String.format(
                TEMPLATE,
                "Fornecedor Teste",
                gerarCnpjValido(),
                "teste@teste.com"
        );

        given()
                .contentType(ContentType.JSON)
                .body(payload)
                .pathParam("id", 999999L)
                .when().put(ADMIN_PATH + "/{id}")
                .then()
                .statusCode(404)
                .body("detail", is("Fornecedor não encontrado"));
    }

    @Test
    void deveRetornar404AoRemoverFornecedorInexistente() {
        given()
                .pathParam("id", 999999L)
                .when().delete(ADMIN_PATH + "/{id}")
                .then()
                .statusCode(404)
                .body("detail", is("Fornecedor não encontrado"));
    }

    @Test
    void deveRetornar422AoBuscarComIdInvalido() {
        given()
                .pathParam("id", 0)
                .when().get(ADMIN_PATH + "/{id}")
                .then()
                .statusCode(422)
                .body("detail", is("Id do fornecedor inválido"));
    }

    @Test
    void deveRetornar422AoAtualizarComIdInvalido() {

        String payload = String.format(
                TEMPLATE,
                "Fornecedor Teste",
                gerarCnpjValido(),
                "teste@teste.com"
        );

        given()
                .contentType(ContentType.JSON)
                .body(payload)
                .pathParam("id", 0)
                .when().put(ADMIN_PATH + "/{id}")
                .then()
                .statusCode(422)
                .body("detail", is("Id do fornecedor inválido"));
    }

    @Test
    void deveRetornar422AoRemoverComIdInvalido() {
        given()
                .pathParam("id", 0)
                .when().delete(ADMIN_PATH + "/{id}")
                .then()
                .statusCode(422)
                .body("detail", is("Id do fornecedor inválido"));
    }

    private Long criarFornecedor(String nome) {

        String cnpj = gerarCnpjValido();

        String email =
                nome.toLowerCase().replace(" ", "")
                + System.nanoTime()
                + "@teste.com";

        return given()
                .contentType(ContentType.JSON)
                .body(String.format(TEMPLATE, nome, cnpj, email))
                .when().post(ADMIN_PATH)
                .then()
                .statusCode(201)
                .extract()
                .jsonPath()
                .getLong("id");
    }
}