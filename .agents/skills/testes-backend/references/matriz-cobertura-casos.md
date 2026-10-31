# Matriz Detalhada de Cobertura de Casos de Teste

Este documento descreve exaustivamente os cenários de teste obrigatórios para cada módulo do **E-Commerce de Drones**, estruturados de acordo com os **12 Pilares da Matriz de Cobertura**.

---

## 1. Módulo: Pedidos, Estoque e Checkout

O fluxo de pedidos é o núcleo financeiro e transacional da aplicação. Deve ser coberto com máximo rigor.

| Pilar | Cenário de Teste | Ação / Requisição | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **1. Sucesso** | Criação de pedido com itens em estoque e cliente válido | `POST /pedidos` com itens válidos e cliente autenticado | Retorna `201 Created`, status `PENDENTE`, débito no estoque do drone, valor total calculado com promoções vigentes |
| **2. Erro de Negócio** | Tentativa de compra de quantidade superior ao estoque | `POST /pedidos` com item solicitando 10 unidades para drone com 3 disponíveis | Retorna `400 Bad Request` com `ValidationException` informando estoque insuficiente; estoque inalterado |
| **3. Validações** | Criação de pedido sem itens ou com quantidade zero/negativa | `POST /pedidos` com `itens = []` ou `quantidade = -1` | Retorna `400 Bad Request` via Bean Validation |
| **4. Autenticação** | Criação de pedido sem token JWT | `POST /pedidos` sem cabeçalho Authorization | Retorna `401 Unauthorized` |
| **5. Autorização** | Endpoint de supervisão geral de pedidos acessado por cliente comum | `GET /pedidos/admin` por usuário com `Role = CLIENTE` | Retorna `403 Forbidden` |
| **6. Isolamento** | Cliente A tenta visualizar ou cancelar pedido do Cliente B | `GET /pedidos/{idDoClienteB}` autenticado como Cliente A | Retorna `403 Forbidden` ou `404 Not Found` |
| **7. Ref. Cruzadas** | Pedido contendo ID de drone inexistente ou inativo (`ativa = false`) | `POST /pedidos` com drone inexistente | Retorna `400 Bad Request` ou `404 Not Found` |
| **8. Transações** | Pedido com 3 itens onde o 3º falha por falta de estoque | `POST /pedidos` com item 1 e 2 disponíveis e item 3 indisponível | Falha atômica: nenhum item criado, nenhum estoque baixado (rollback completo) |
| **9. Vigência** | Pedido com drone em promoção vigente vs expirada | `POST /pedidos` contendo drone com promoção ativa | `ItemPedido.precoUnitario` recebe o valor promocional com desconto |
| **10. Imutabilidade** | Cliente altera seu endereço ou catálogo altera preço após o pedido | 1. Cria pedido 2. Altera endereço principal 3. Altera preço do drone no catálogo | Endereço do pedido e `ItemPedido.precoUnitario` permanecem idênticos ao momento da compra |
| **11. Concorrência** | 5 requisições simultâneas tentando comprar o último item de estoque | `POST /pedidos` concorrentes via threads | Apenas 1 pedido criado com sucesso; 4 requisições rejeitadas com erro 400; estoque final = 0 |
| **12. Regressão** | Cancelamento de pedido com estorno automático de estoque | `PATCH /pedidos/{id}/cancelar` | Status do pedido e pagamento viram `CANCELADO`; estoque de cada item é estornado com precisão |

---

## 2. Módulo: Catálogo de Drones, Marcas e Modelos

| Pilar | Cenário de Teste | Ação / Requisição | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **1. Sucesso** | Cadastro de Drone por administrador com dados válidos | `POST /drones` com modelo pertencente à marca indicada | Retorna `201 Created` com DTO de resposta preenchido |
| **2. Erro / Ref. Cruzada** | Inconsistência Marca-Modelo (Modelo pertence à Marca X, mas requisição informa Marca Y) | `POST /drones` com `marcaId = 1` e `modeloId = 5` (onde modelo 5 é da marca 2) | Retorna `400 Bad Request` com mensagem: `"O modelo selecionado não pertence à marca escolhida"` |
| **3. Validações** | Cadastro de Drone com preço negativo ou zero | `POST /drones` com `preco = -50.0` | Retorna `400 Bad Request` via Bean Validation |
| **4. Autenticação** | Tentativa de cadastrar drone sem credenciais | `POST /drones` anônimo | Retorna `401 Unauthorized` |
| **5. Autorização** | Cliente comum tentando cadastrar ou alterar drone | `POST /drones` ou `PUT /drones/{id}` com `Role = CLIENTE` | Retorna `403 Forbidden` |
| **10. Histórico** | Consulta pública de catálogo (`GET /drones/ecommerce`) | `GET /drones/ecommerce` | Retorna apenas produtos com `ativa = true`, aplicando promoções vigentes |

---

## 3. Módulo: Upload e Gestão de Imagens de Drones

| Pilar | Cenário de Teste | Ação / Requisição | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **1. Sucesso** | Upload de imagem PNG/JPEG válida para drone | `POST /drones/{id}/imagens` com arquivo válido | Retorna `201 Created`, arquivo salvo fisicamente e registrado no banco |
| **2. Erro de Negócio** | Tentativa de adicionar mais de 5 imagens ao mesmo drone | `POST /drones/{id}/imagens` quando drone já possui 5 fotos | Retorna `400 Bad Request` com mensagem de limite máximo atingido |
| **8. Transações** | Exclusão de imagem principal | `DELETE /drones/{id}/imagens/{imgId}` para a imagem marcada como `principal = true` | Imagem excluída do banco e do disco; a primeira imagem restante torna-se a nova principal |
| **7. Ref. Cruzadas** | Tentar excluir ou alterar foto passando ID de outro drone | `DELETE /drones/{id1}/imagens/{imgDoDrone2}` | Retorna `404 Not Found` ou `400 Bad Request` |

---

## 4. Módulo: Campanhas Promocionais e Vigência

| Pilar | Cenário de Teste | Regra Avaliada | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **9. Vigência (Futura)** | Promoção com `dataInicio > agora` | Não está vigente | Preço cobrado no pedido é o preço integral sem desconto |
| **9. Vigência (Ativa)** | Promoção com `dataInicio <= agora <= dataFim` | Vigência ativa | Preço cobrado: `precoOriginal * (1 - desconto/100)` |
| **9. Vigência (Expirada)**| Promoção com `dataFim < agora` | Desconto expirado | Preço cobrado no pedido é o preço integral sem desconto |
| **3. Validações** | Promoção com percentual <= 0 ou > 100 | Validação de limites | Retorna `400 Bad Request` |

---

## 5. Módulo: Pagamentos Polimórficos

| Pilar | Cenário de Teste | Ação / Requisição | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **1. Sucesso PIX** | Geração e liquidação de pagamento PIX | `PATCH /pedidos/pagamentos/pix/{id}/pagar` | Chave PIX UUID gerada; status do pagamento vira `APROVADO` e do pedido vira `PAGO` |
| **1. Sucesso Cartão** | Pagamento via Cartão de Crédito com dados válidos | `PATCH /pedidos/pagamentos/cartao/{id}/pagar` | Status do pagamento vira `APROVADO` e do pedido vira `PAGO` |
| **2. Erro de Negócio** | Tentativa de pagar pedido já `PAGO` ou já `CANCELADO` | `PATCH /pedidos/pagamentos/pix/{id}/pagar` em pedido pago | Retorna `400 Bad Request` impedindo pagamento duplicado |
| **2. Erro de Negócio** | Pagamento com valor divergente do valor total do pedido | Submissão de pagamento com `valor != pedido.valorTotal` | Rejeição imediata com `ValidationException` |

---

## 6. Módulo: Usuários, Perfis e Endereços

| Pilar | Cenário de Teste | Ação / Requisição | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **1. Sucesso** | Cadastro público de cliente | `POST /clientes` com login e email únicos | Usuário criado com `Perfil.CLIENTE`, senha hasheada com BCrypt |
| **5. Autorização** | Criação de administrador por cliente comum | `POST /usuarios/admin` autenticado como `CLIENTE` | Retorna `403 Forbidden` |
| **5. Autorização** | Criação de administrador por usuário `ADMIN` | `POST /usuarios/admin` autenticado como `ADMIN` | Retorna `201 Created` |
| **6. Isolamento** | Adição de endereço vinculada automaticamente ao usuário autenticado | `POST /clientes/enderecos` | Endereço associado ao usuário do JWT (`jwt.getName()`), impossível injetar endereço em outro cliente |
| **2. Erro de Negócio** | Cliente tenta remover seu único endereço cadastrado | `DELETE /clientes/enderecos/{id}` quando há apenas 1 endereço | Retorna `400 Bad Request` com mensagem impeditiva |
| **8. Transações** | Definir endereço como principal | `PATCH /clientes/enderecos/{id}/principal` | O endereço vira principal e todos os outros endereços do usuário são desmarcados (`isPrincipal = false`) |

---

## 7. Módulo: Avaliações e Favoritos

| Pilar | Cenário de Teste | Ação / Requisição | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **3. Validações** | Avaliação com nota fora de [1..5] | `POST /drones/{id}/avaliacoes` com `nota = 0` ou `nota = 6` | Retorna `400 Bad Request` |
| **6. Isolamento** | Usuário A tentando excluir avaliação postada por Usuário B | `DELETE /avaliacoes/{id}` autenticado como Usuário A | Retorna `403 Forbidden` (permitido apenas para o autor ou `ADMIN`) |
| **1. Sucesso** | Adição e remoção idempotente de favoritos | `POST /favoritos/{droneId}` e `DELETE /favoritos/{droneId}` | Drone associado/desassociado da lista de favoritos do usuário logado |
