# Arquitetura e Configuração de Testes em Quarkus & Java 25

Este guia estabelece as diretrizes arquiteturais e configurações de ambiente para testes automatizados no backend do **E-Commerce de Drones**.

---

## 1. Configuração do Perfil de Testes (`%test`)

No Quarkus, propriedades prefixadas com `%test.` no arquivo `backend/src/main/resources/application.properties` ou em `backend/src/test/resources/application.properties` têm precedência durante a execução do comando `./mvnw test`.

### Configuração Recomendada de Banco de Dados para Testes:

```properties
# Em backend/src/test/resources/application.properties (ou com prefixo %test)

# Se houver Dev Services com Podman/Docker habilitado:
# %test.quarkus.devservices.enabled=true

# Se utilizar o PostgreSQL local rodando na porta 5432:
%test.quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/dronesDb
%test.quarkus.datasource.username=postgres
%test.quarkus.datasource.password=123456

# Estratégia de schema nos testes:
%test.quarkus.hibernate-orm.database.generation=drop-and-create
%test.quarkus.hibernate-orm.log.sql=false

# Chaves JWT para validação de testes de segurança:
%test.mp.jwt.verify.publickey.location=META-INF/resources/publicKey.pem
%test.mp.jwt.verify.issuer=armas-api
%test.smallrye.jwt.sign.key.location=META-INF/resources/privateKey.pem

# Mock de envio de emails para evitar disparo real em testes:
%test.quarkus.mailer.mock=true
```

> **Atenção**: Sempre mantenha `%test.quarkus.mailer.mock=true` para que nenhum e-mail real seja disparado acidentalmente para provedores externos durante a suíte de testes.

---

## 2. Anotações Quarkus Fundamentais

### `@QuarkusTest`
Anotação primária aplicada na classe de teste. Inicializa o contexto do Quarkus, a injeção CDI, a conexão com o banco e o servidor HTTP para REST Assured:
```java
@QuarkusTest
class PedidoResourceTest { ... }
```

### `@TestTransaction` vs `@Transactional`
- **`@TestTransaction`**: Envolve o método de teste em uma transação de banco de dados e executa um **rollback automático** ao final do método. Ideal para testes de persistência que não podem deixar dados residuais para os próximos testes.
  *Nota*: Não funciona em chamadas HTTP via REST Assured, pois a requisição HTTP é processada em uma thread e transação separada da thread do teste.
- **Para testes de API REST (REST Assured)**: Como a chamada HTTP roda no servidor Quarkus em outra thread, limpe ou crie registros específicos com identificadores únicos (ex: UUIDs) para manter os testes idempotentes.

### `@TestSecurity` e `@JwtSecurity`
Permite simular um contexto autenticado pelo Quarkus SmallRye JWT sem precisar gerar tokens reais ou chamar o endpoint de login:

```java
import io.quarkus.test.security.TestSecurity;
import io.quarkus.test.security.jwt.Claim;
import io.quarkus.test.security.jwt.JwtSecurity;

// Simular um cliente autenticado com claims JWT customizadas:
@Test
@TestSecurity(user = "cliente", roles = "CLIENTE")
@JwtSecurity(claims = {
    @Claim(key = "id", value = "2"),
    @Claim(key = "email", value = "cliente@example.com"),
    @Claim(key = "sub", value = "cliente")
})
void deveCriarPedidoComSucesso() {
    // Chamada REST Assured autenticada
}

// Simular um administrador:
@Test
@TestSecurity(user = "rhuan", roles = "ADMIN")
void deveCadastrarNovoDroneComSucesso() {
    // Chamada REST Assured administrativa
}

// Simular acesso não autenticado (anônimo):
@Test
void deveRetornar401QuandoUsuarioNaoAutenticado() {
    // Omissão da anotação @TestSecurity resulta em chamada sem credenciais
}
```

---

## 3. Padrão de Testes de API com REST Assured

O REST Assured integra-se nativamente com o Quarkus, injetando a porta dinâmica da aplicação automaticamente:

```java
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class DroneResourceTest {

    @Test
    @DisplayName("Deve listar drones com paginação e status 200")
    void deveListarDronesPaginados() {
        given()
            .contentType(ContentType.JSON)
            .queryParam("page", 0)
            .queryParam("pageSize", 10)
        .when()
            .get("/drones")
        .then()
            .statusCode(200)
            .contentType(ContentType.JSON)
            .body("items", notNullValue())
            .body("page", equalTo(0))
            .body("pageSize", equalTo(10));
    }
}
```

### Extração e Mapeamento de Respostas com Records Java 25:
```java
DroneResponseDTO response = given()
    .contentType(ContentType.JSON)
    .body(requestDTO)
.when()
    .post("/drones")
.then()
    .statusCode(201)
    .extract().as(DroneResponseDTO.class);

assertNotNull(response.id());
assertEquals("DJI Mavic 3", response.nome());
```

---

## 4. Uso Correto de Mocks (`@InjectMock`)

### O que NUNCA Mockar:
- **Entidades JPA e Panache Repositories**: Em testes de integração, os repositórios devem consultar o banco de dados real PostgreSQL para garantir validação de integridade referencial, foreign keys e integridade de tipos.
- **Services de Domínio**: Não mocke os services em testes de API REST se o objetivo for testar o fluxo de ponta a ponta.

### O que PODE Mockar:
- **`io.quarkus.mailer.Mailer`**: Envio de e-mails transacionais (evita dependência do Mailtrap).
- **Gateways de Pagamento Externos**: Webhooks ou chamadas HTTP para operadoras de cartão externas (quando implementadas).

Exemplo de mock com `@InjectMock`:
```java
@InjectMock
Mailer mailerMock;

@Test
void deveEnviarEmailAoRecuperarSenha() {
    Mockito.doNothing().when(mailerMock).send(Mockito.any(Mail.class));
    // Executa fluxo de recuperação
    Mockito.verify(mailerMock, Mockito.times(1)).send(Mockito.any(Mail.class));
}
```

---

## 5. Isolamento e Idempotência dos Testes

Para garantir que os testes possam rodar em qualquer ordem ou em paralelo sem interferências mútuas:
1. **Dados Semente**: Apoie-se nos dados semente de `import.sql` para leituras seguras (IDs conhecidos como Cidade `1`, Estado `1`, Usuário `1`).
2. **Dados Criados Dinamicamente**: Para testes de escrita (`POST`), utilize identificadores únicos em campos com restrição UNIQUE (ex: login gerado com `UUID.randomUUID().toString().substring(0, 8)`).
3. **Rollback e Limpeza**: Em testes de service puro, utilize `@TestTransaction`. Em testes de REST Assured, remova os dados criados no `@AfterEach` caso possam causar conflito em testes subsequentes.
