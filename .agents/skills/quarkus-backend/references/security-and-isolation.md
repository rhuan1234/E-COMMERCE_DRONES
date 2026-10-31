# Segurança, Autorização e Isolamento de Usuários - Quarkus Backend

Este documento define os padrões mandatórios de segurança para desenvolvimento e revisão de código no backend Quarkus, com foco em autenticação assimétrica via JWT, controle de acesso baseado em papéis (RBAC) e garantia de isolamento entre usuários.

---

## 1. Autenticação Stateless via JWT Assimétrico (RSA)

O sistema opera com autenticação stateless utilizando SmallRye JWT (`quarkus-smallrye-jwt`):
- **Assinatura**: Feita pela aplicação utilizando a chave privada RSA (`META-INF/resources/privateKey.pem`).
- **Validação**: As requisições são validadas automaticamente pelo Quarkus utilizando a chave pública RSA (`META-INF/resources/publicKey.pem`).
- **Segurança de Chaves**:
  - A chave privada **NUNCA** deve ser exposta via endpoints REST, commitada em locais públicos ou impressa em logs.
  - O cabeçalho de autenticação enviado pelo cliente é sempre `Authorization: Bearer <token>`.

---

## 2. Controle de Acesso Baseado em Papéis (RBAC)

O domínio define dois perfis de usuário (`Perfil.java`):
1. **`ADMIN`**:
   - Acesso total à gestão de catálogo (drones, câmeras, marcas, modelos), fornecedores, promoções, análise de pedidos e criação de novos administradores.
   - Endpoints administrativos **DEVEM** conter:
     ```java
     @RolesAllowed("ADMIN")
     ```
2. **`CLIENTE`**:
   - Acesso a operações de compra, gestão de múltiplos endereços, favoritos, histórico e cancelamento de seus próprios pedidos.
   - Endpoints de clientes autenticados **DEVEM** conter:
     ```java
     @RolesAllowed({"CLIENTE", "ADMIN"})
     // ou
     @Authenticated
     ```
3. **Público (Anônimo)**:
   - Endpoints de consulta à vitrine (`GET /drones`, `GET /drones/{id}`), cadastro público de cliente (`POST /clientes`) e login (`POST /auth/login`).
   - Não devem conter anotações de segurança restritivas.

---

## 3. Isolamento Estrito de Usuários e Prevenção contra IDOR

> ⚠️ **REGRA CRÍTICA CONTRA IDOR (Insecure Direct Object Reference)**:
> O backend **NUNCA** deve confiar em identificadores de usuário (`usuarioId`, `clienteId`, `login`) enviados no corpo da requisição ou em parâmetros de consulta para operações privadas do próprio usuário.

### 3.1 Padrão de Identificação do Usuário Logado
Nos Resources JAX-RS, injete a instância do token JWT:

```java
@Inject
JsonWebToken jwt;

@Inject
UsuarioService usuarioService;

// Dentro do endpoint:
String login = jwt.getName();
if (login == null || login.isBlank()) {
    throw new ValidationException("Usuário não autenticado");
}

Usuario usuario = usuarioService.buscarPorLogin(login);
if (usuario == null) {
    throw new NotFoundException("Usuário não encontrado");
}
```

### 3.2 Validação de Propriedade (Ownership)
Ao consultar, alterar ou cancelar recursos pertencentes a um cliente (ex: Pedido, Endereço, Favorito, Avaliação):
1. O Service deve verificar se o registro pertence ao usuário autenticado:
   ```java
   if (!pedido.getUsuario().getId().equals(usuarioAutenticado.getId()) 
           && !usuarioAutenticado.getPerfil().equals(Perfil.ADMIN)) {
       throw new ValidationException("Você não possui permissão para acessar este recurso");
   }
   ```
2. Para listagens de cliente (ex: `/pedidos`), a query do banco **DEVE** filtrar explicitamente pelo ID ou Login do usuário logado:
   ```java
   return pedidoRepository.find("usuario.id = ?1 order by dataPedido desc", usuario.getId())
           .page(Page.of(page, pageSize))
           .list();
   ```

---

## 4. Proteção de Dados Sensíveis e Criptografia

1. **Senhas**:
   - Devem ser criptografadas com hash BCrypt (`jbcrypt` 0.4 ou biblioteca equivalente) antes da gravação no banco de dados.
   - NUNCA retorne o campo `senha` ou qualquer hash em DTOs de resposta (`*ResponseDTO`).
2. **Dados de Cartão de Crédito**:
   - Em conformidade com PCI-DSS simplificado, dados completos de cartão (número, validade, CVV) não devem ser persistidos em texto plano.
   - O código CVV **JAMAIS** deve ser gravado no banco de dados.
   - Apenas o número mascarado (ex: `**** **** **** 1234`) e a bandeira podem ser armazenados para histórico.
3. **Tokens de Recuperação de Senha**:
   - Gerados com `UUID.randomUUID().toString()`.
   - Validade restrita a 2 horas.
   - Devem ser invalidados após o primeiro uso (`usado = true`).

---

## 5. Prevenção de Outras Vulnerabilidades Comuns

1. **SQL Injection**:
   - É estritamente proibida a concatenação direta de parâmetros em strings HQL/SQL:
     ```java
     // ❌ PROIBIDO:
     find("nome = '" + nome + "'");

     // ✅ CORRETO (parâmetro posicional ou nomeado):
     find("nome = ?1", nome);
     find("nome = :nome", Parameters.with("nome", nome));
     ```
2. **Path Traversal em Uploads de Imagens**:
   - No armazenamento de imagens de drones (`uploads/`), os nomes de arquivo físicos devem ser gerados como UUIDs seguros (`UUID.randomUUID().toString() + ".jpg"`), descartando o nome original do arquivo fornecido pelo cliente.
   - Validar estritamente as extensões permitidas (`jpg`, `jpeg`, `png`, `webp`) e o tipo MIME do arquivo.
