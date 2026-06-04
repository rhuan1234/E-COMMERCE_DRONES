package armas;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class FornecedorControllerTest {

    private static final String TEMPLATE = "{\n" +
            "  \"nome\": \"%s\",\n" +
            "  \"cnpj\": \"%s\",\n" +
            "  \"email\": \"%s\",\n" +
            "  \"telefone\": { \"numero\": \"11999999999\" },\n" +
            "  \"ativo\": true,\n" +
            "  \"endereco\": {\n" +
            "    \"rua\": \"Rua Exemplo\",\n" +
            "    \"bairro\": \"Bairro Exemplo\",\n" +
            "    \"cidade\": \"Cidade Exemplo\",\n" +
            "    \"estado\": \"SP\",\n" +
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
    void testFindAllEndpoint() {
        Long id = createFornecedor("Fornecedor FindAll");

        given()
                .when().get("/fornecedores")
                .then()
                .statusCode(200)
                .body("size()", greaterThanOrEqualTo(1))
                .body("id", hasItem(id.intValue()));
    }

    @Test
    void testCreateEndpoint() {
        String nome = "Fornecedor Create";
        String cnpj = gerarCnpjValido();
        String email = nome.toLowerCase().replace(" ", "") 
              + System.nanoTime() + "@teste.com";

        given()
                .contentType(ContentType.JSON)
                .body(String.format(TEMPLATE, nome, cnpj, email))
                .when().post("/fornecedores")
                .then()
                .statusCode(201)
                .body("id", notNullValue())
                .body("nome", is(nome))
                .body("telefone.numero", is("11999999999"))
                .body("endereco.cidade", is("Cidade Exemplo"));
    }

    @Test
    void testFindByIdEndpoint() {
        Long id = createFornecedor("Fornecedor FindById");

        given()
                .pathParam("id", id)
                .when().get("/fornecedores/{id}")
                .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("nome", is("Fornecedor FindById"));
    }

    @Test
    void testFindByNomeEndpoint() {
        String nome = "Fornecedor FindByNome";
        createFornecedor(nome);

        given()
                .pathParam("nome", nome)
                .when().get("/fornecedores/nome/{nome}")
                .then()
                .statusCode(200)
                .body("nome", is(nome))
                .body("cnpj", notNullValue());
    }

    @Test
    void testUpdateEndpoint() {
        Long id = createFornecedor("Fornecedor Update");
        String email = "update" + System.nanoTime() + "@teste.com";
        String cnpj = gerarCnpjValido();
        String updatedJson = String.format("{\n" +
        "  \"nome\": \"Fornecedor Atualizado\",\n" +
        "  \"cnpj\": \"%s\",\n" +
        "  \"email\": \"%s\",\n" +
        "  \"telefone\": { \"numero\": \"11988888888\" },\n" +
        "  \"ativo\": false,\n" +
        "  \"endereco\": {\n" +
        "    \"rua\": \"Rua Atualizada\",\n" +
        "    \"bairro\": \"Bairro Atualizado\",\n" +
        "    \"cidade\": \"Cidade Atualizada\",\n" +
        "    \"estado\": \"SP\",\n" +
        "    \"cep\": \"98765000\"\n" +
        "  }\n" +
        "}",
        cnpj,
        email
);

        given()
                .contentType(ContentType.JSON)
                .body(updatedJson)
                .pathParam("id", id)
                .when().put("/fornecedores/{id}")
                .then()
                .statusCode(200)
                .body("id", is(id.intValue()))
                .body("nome", is("Fornecedor Atualizado"))
                .body("email", is(email))
                .body("ativo", is(false))
                .body("telefone.numero", is("11988888888"));
    }

    @Test
    void testDeleteEndpoint() {
        Long id = createFornecedor("Fornecedor Delete");

        given()
                .pathParam("id", id)
                .when().delete("/fornecedores/{id}")
                .then()
                .statusCode(204);

        given()
                .pathParam("id", id)
                .when().get("/fornecedores/{id}")
                .then()
                .statusCode(404)
                .body("type", is("https://tools.ietf.org/html/rfc7807"))
                .body("title", is("Not Found"))
                .body("status", is(404))
                .body("detail", is("Fornecedor not found"));
    }

    private Long createFornecedor(String nome) {
        String cnpj = gerarCnpjValido();
        String email = nome.toLowerCase().replace(" ", "") 
              + System.nanoTime() + "@teste.com";
        return given()
                .contentType(ContentType.JSON)
                .body(String.format(TEMPLATE, nome, cnpj, email))
                .when().post("/fornecedores")
                .then()
                .statusCode(201)
                .extract()
                .jsonPath().getLong("id");
    }
}
