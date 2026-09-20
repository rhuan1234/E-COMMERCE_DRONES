# Padrão de Respostas da API (API Response Standards)

Este documento define o formato padronizado de respostas JSON para a comunicação entre o backend e o frontend. Seguir este padrão garantirá consistência e facilidade no tratamento de dados, formulários e erros no lado do cliente.

## 1. Estrutura Geral
Todas as respostas da API devem retornar um objeto JSON base, independentemente de ser um sucesso ou falha, com as seguintes propriedades:

*   **`success`** (boolean): Indica se a operação foi bem-sucedida (`true`) ou se ocorreu algum erro (`false`).
*   **`message`** (string, opcional): Uma mensagem descritiva (útil tanto para sucesso, como "Salvo com sucesso", quanto para erros amigáveis para o usuário).

---

## 2. Respostas de Sucesso (Success Responses)

Para as requisições bem-sucedidas (HTTP Status `200 OK`, `201 Created`), o objeto JSON deve conter a propriedade **`data`**.

*   **`data`** (object | array | null): O "payload" da resposta, contendo os dados solicitados.

### Exemplo: Retornando um único objeto
```json
{
  "success": true,
  "message": "Produto encontrado.",
  "data": {
    "id": 123,
    "name": "Drone X1",
    "price": 1500.00
  }
}
```

---

## 3. Respostas de Erro (Error Responses)

Para erros (HTTP Status `400`, `401`, `403`, `404`, `500`), o objeto JSON deve omitir a propriedade `data` e utilizar a propriedade **`error`**.

*   **`error`** (object): Objeto contendo detalhes técnicos sobre o erro.
    *   **`code`** (string): Um código string padronizado (ex: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`).
    *   **`details`** (array, opcional): Uma lista de erros detalhados. Essencial para validação de formulários no frontend, indicando os campos específicos que falharam.

### Exemplo: Erro de Validação de Formulário (400 Bad Request)
```json
{
  "success": false,
  "message": "Os dados informados são inválidos.",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "price",
        "issue": "O preço não pode ser menor que zero."
      },
      {
        "field": "name",
        "issue": "O nome do produto é obrigatório."
      }
    ]
  }
}
```

### Exemplo: Recurso não encontrado (404 Not Found)
```json
{
  "success": false,
  "message": "O drone solicitado não foi encontrado no sistema.",
  "error": {
    "code": "RESOURCE_NOT_FOUND"
  }
}
```

---

## 4. Respostas Paginadas (Paginated Responses)

Para endpoints que retornam listas (ex: Catálogo de Drones), a resposta de sucesso deve incluir a propriedade **`meta`** para auxiliar a construção de tabelas e paginação no frontend.

*   **`data`** (array): O array de itens daquela página específica.
*   **`meta`** (object): Informações do estado da paginação.
    *   **`page`** (number): Página atual (ex: 0).
    *   **`size`** (number): Quantidade de itens retornados por página (ex: 20).
    *   **`totalElements`** (number): Total absoluto de itens cadastrados no banco.
    *   **`totalPages`** (number): Total de páginas disponíveis.

### Exemplo: Listagem com paginação
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Drone Básico" },
    { "id": 2, "name": "Drone Profissional" }
  ],
  "meta": {
    "page": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8
  }
}
```

---

## Como o Frontend deve interceptar as respostas

Sugere-se o uso de *Interceptors* (por exemplo, com o Axios) no frontend para padronizar o consumo:

1.  **Sucesso (`response.data`)**: Ler diretamente de `response.data.data` (para os itens) e `response.data.meta` (para a paginação).
2.  **Erro Global (`catch`)**: Verificar se `error.response.data.success` é `false` e exibir o alerta para o usuário usando `error.response.data.message`.
3.  **Tratamento Específico**: Utilizar o `error.response.data.error.code` (como `UNAUTHORIZED` para deslogar o usuário e redirecionar para a tela de login) ou ler o array `details` para pintar os campos vermelhos em formulários.
