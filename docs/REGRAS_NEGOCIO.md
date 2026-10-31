# Regras de Negócio - E-Commerce de Drones

Este documento detalha o comportamento esperado do sistema **E-Commerce de Drones**, descrevendo suas entidades de domínio, fluxos operacionais, validações de integridade e regras de negócio aplicadas no backend e frontend.

---

## 1. Visão Geral das Entidades de Domínio

O domínio do sistema é particionado nos seguintes pacotes e entidades:

### 1.1 Usuários e Segurança (`drones.model.usuario`)
- **`Usuario`**:
  - Representa os atores do sistema, tanto administradores (`ADMIN`) quanto clientes compradores (`CLIENTE`).
  - Atributos principais: `id`, `login` (único, obrigatório), `senhaHash` (criptografia BCrypt), `perfil` (`ADMIN` ou `CLIENTE`), `email` (único, formato de email válido), `nomeCompleto`, `cpf` (único, formato com máscara ou 11 dígitos), `telefone`, `ativo` (flag booleano), `enderecos` (lista 1:N) e `enderecoPrincipalId` (identificador do endereço padrão).
- **`Perfil` (Enum)**:
  - `ADMIN`: Acesso irrestrito a funcionalidades de gestão de catálogo, fornecedores, promoções, análise de pedidos e criação de outros administradores.
  - `CLIENTE`: Acesso a compras, vitrine, favoritos, avaliações, gestão do próprio perfil e pedidos próprios.
- **`TokenResetarSenha`**:
  - Registra solicitações de recuperação de senha.
  - Atributos: `id`, `token` (string UUID aleatória), `expiracao` (data/hora limite de validade), `usado` (indica se já foi consumido) e `usuario` (relação ManyToOne).

### 1.2 Localidades e Fornecedores (`drones.model.fornecedor`)
- **`Estado`**:
  - Unidade federativa (`id`, `nome`). Relaciona-se com `Cidade` (1:N).
- **`Cidade`**:
  - Município (`id`, `nome`, `estado`). Relaciona-se com `Endereco` (1:N).
- **`Endereco`**:
  - Endereço físico completo (`id`, `rua`, `bairro`, `cep`, `cidade`, `isPrincipal`).
  - Pode pertencer a um `Usuario` (OneToMany) ou a um `Fornecedor` (OneToOne).
- **`Fornecedor`**:
  - Empresa parceira/distribuidora que fornece os drones.
  - Atributos: `id`, `nome` (razão social/nome fantasia), `cnpj` (único, validado pelo algoritmo oficial brasileiro), `email` (único), `telefone`, `ativo` (status operacional), `endereco` (relação OneToOne em cascata) e `drones` (lista de produtos fornecidos).

### 1.3 Catálogo de Drones (`drones.model.drones`)
- **`Marca`**:
  - Fabricante de drones ou câmeras (ex: DJI, Autel Robotics). Possui `id`, `nome` e lista de `modelos` (1:N).
- **`Modelo`**:
  - Modelo específico vinculado obrigatoriamente a uma `Marca` (`id`, `nome`, `marca`).
- **`Camera`**:
  - Equipamento óptico integrado ou acoplável ao drone.
  - Atributos: `id`, `marca` (ManyToOne), `modelo` (ManyToOne), `resolucao` (ex: "4K", "1080p"), `zoom` (multiplicador inteiro), `estabilizacao` (booleano) e `fps` (taxa de quadros por segundo).
- **`Drone`**:
  - Produto central do e-commerce.
  - Atributos comerciais: `id`, `nome`, `marca` (ManyToOne), `modelo` (ManyToOne), `fornecedor` (ManyToOne), `preco` (double), `quantidadeDisponivel` (inteiro, controle de estoque), `ativa` (visibilidade na loja), `promocao` (ManyToOne opcional).
  - Especificações técnicas: `tempoVooPratico` (minutos), `pesoDecolagem` (gramas), `altitudeMaxima` (metros), `velocidadeMaxima` (km/h), `alcanceTransmissao` (metros), `possuiCamera` (booleano), `camera` (ManyToOne opcional), `quantidadeMotores` (inteiro), `comControleRemoto` (booleano), `controladoPorAplicativo` (booleano), `quantidadeBaterias` (inteiro), `duracaoBateria` (minutos/descrição), `frequenciaWifi` (GHz) e `possuiGPS` (booleano).
  - Mídias: `imagens` (lista de `DroneImage`, OneToMany cascade).
- **`DroneImage`**:
  - Imagem do produto armazenada no servidor.
  - Atributos: `id`, `caminho` (nome do arquivo salvo em disco), `principal` (booleano indicando foto de capa), `ordem` (posição de ordenação) e `drone` (ManyToOne).
- **`Avaliacao`**:
  - Feedback de compradores sobre o produto.
  - Atributos: `id`, `nota` (inteiro de 1 a 5), `comentario` (texto de até 1000 caracteres), `dataAvaliacao` (timestamp), `usuario` (ManyToOne) e `drone` (ManyToOne).
- **`Favorito`**:
  - Marcador de item preferido pelo usuário (`id`, `usuario`, `drone`).

### 1.4 Campanhas e Promoções (`drones.model.promocao`)
- **`Promocao`**:
  - Campanha de desconto aplicável a produtos.
  - Atributos: `id`, `nome`, `percentualDesconto` (BigDecimal de desconto, ex: 10.00 para 10%), `dataInicio` (timestamp), `dataFim` (timestamp) e `drones` (lista de produtos vinculados).

### 1.5 Pedidos e Checkout (`drones.model.pedido`)
- **`Pedido`**:
  - Transação de compra de um cliente.
  - Atributos: `id`, `usuario` (ManyToOne), `dataPedido` (timestamp), `valorTotal` (calculado após descontos), `statusPedido` (Enum `StatusPedido`), `itens` (lista de `ItemPedido`, OneToMany), `pagamento` (OneToOne).
  - Snapshot de entrega: `ruaEntrega`, `bairroEntrega`, `cidadeEntrega`, `estadoEntrega`, `cepEntrega`.
- **`ItemPedido`**:
  - Item unitário da compra: `id`, `drone` (ManyToOne), `quantidade` (inteiro positivo), `precoUnitario` (preço unitário efetivamente cobrado na data do pedido) e método derivado `getSubtotal()`.
- **`StatusPedido` (Enum)**:
  - `PENDENTE`: Pedido criado no sistema aguardando liquidação do pagamento.
  - `PAGO`: Pagamento validado e aprovado com sucesso; pedido pronto para expedição.
  - `CANCELADO`: Pedido cancelado (por ação do usuário ou falta de pagamento), com estoque estornado.
- **`Pagamento` (Classe Abstrata JPA Joined)**:
  - `id`, `valor` (Double, estritamente igual ao valor total do pedido), `statusPagamento` (Enum `StatusPagamento`) e `pedido` (OneToOne).
- **`PagamentoPix`**:
  - Especialização de `Pagamento` para transações instantâneas. Atributo adicional: `chavePix` (String UUID aleatória de pagamento).
- **`PagamentoCartao`**:
  - Especialização de `Pagamento` para transações de cartão de crédito. Atributos: `numeroCartao` (armazenado/mascarado), `nomeTitular`, `dataValidade` (MM/AA) e `codigoSeguranca` (CVV).
- **`StatusPagamento` (Enum)**:
  - `PENDENTE`: Transação gerada aguardando confirmação bancária/cliente.
  - `APROVADO`: Transação autorizada com sucesso.
  - `CANCELADO`: Transação cancelada ou estornada.

---

## 2. Fluxos e Regras Operacionais

### 2.1 Fluxo de Autenticação e Gestão de Usuários
1. **Cadastro de Clientes (`POST /clientes`)**:
   - Qualquer visitante pode se cadastrar como cliente informando `login`, `senha` e `email`.
   - O sistema valida a unicidade do login e email.
   - A senha é criptografada com algoritmo BCrypt antes de ser persistida.
   - O perfil atribuído é obrigatoriamente `Perfil.CLIENTE`.
2. **Cadastro de Administradores (`POST /usuarios/admin`)**:
   - Somente usuários autenticados com a Role `ADMIN` podem registrar novos administradores.
   - O perfil atribuído é `Perfil.ADMIN`.
3. **Autenticação (`POST /auth/login`)**:
   - O usuário informa `login` e `senha`.
   - Caso as credenciais coincidam com o hash armazenado e o usuário esteja ativo (`ativo = true`), o sistema gera um token JWT assinado com as claims do usuário (`sub`, `id`, `groups` contendo o perfil).
4. **Recuperação de Senha ("Esqueci minha senha")**:
   - O cliente solicita recuperação informando seu login/email (`POST /clientes/esqueci-senha`).
   - Se o usuário existir, o sistema gera um registro `TokenResetarSenha` com token UUID aleatório e expiração definida para 2 horas no futuro.
   - Um email é disparado via Quarkus Mailer para o endereço cadastrado contendo o link de recuperação.
   - Na redefinição (`POST /clientes/resetar-senha`), o sistema valida se o token existe, não expirou e não foi utilizado (`usado == false`).
   - Sendo válido, a nova senha é hasheada e gravada, e o token é marcado como `usado = true`.
5. **Alteração de Senha**:
   - O usuário autenticado pode alterar sua própria senha fornecendo a senha atual e a nova senha. O sistema valida se a senha atual confere com o hash gravado.

### 2.2 Fluxo de Endereços do Cliente
1. Um cliente pode cadastrar múltiplos endereços residenciais ou de entrega.
2. Cada endereço é composto por `rua`, `bairro`, `cep` e relacionamento obrigatório com `Cidade` (que referencia `Estado`).
3. O cliente possui um `enderecoPrincipalId`.
4. Ao adicionar ou editar um endereço com a flag `isPrincipal = true`:
   - Todos os outros endereços do usuário têm `isPrincipal` ajustado para `false`.
   - O campo `enderecoPrincipalId` do usuário é atualizado com o ID deste endereço.
5. Um cliente não pode remover um endereço caso ele seja o único registrado em sua conta.

### 2.3 Fluxo de Catálogo, Marcas e Modelos
1. **Consistência de Marca e Modelo**:
   - Um `Modelo` obrigatoriamente pertence a uma `Marca` (`modelo.marca != null`).
   - Ao cadastrar ou atualizar um `Drone` ou uma `Camera`, o sistema valida se a `Marca` informada é exatamente a dona do `Modelo` selecionado:
     $$\text{modelo.getMarca().getId()} == \text{marca.getId()}$$
   - Caso contrário, uma `ValidationException` com a mensagem `"O modelo selecionado não pertence à marca escolhida"` é disparada.
2. **Fornecedor Obrigatório**:
   - Todo drone cadastrado deve estar associado a um `Fornecedor` ativo no sistema.
3. **Gerenciamento de Imagens do Drone**:
   - Cada drone pode possuir no máximo 5 imagens vinculadas. Tentativas de adicionar mais de 5 geram erro de validação.
   - Uma imagem pode ser definida como principal (`principal = true`).
   - Ao marcar uma imagem como principal, todas as outras imagens do drone são definidas como `principal = false`.
   - Ao remover uma imagem do banco de dados, o arquivo correspondente na pasta de uploads é excluído fisicamente. Se a imagem removida era a principal e ainda restarem imagens, a primeira remanescente assume o papel de imagem principal.
4. **Visibilidade do Produto (`ativa`)**:
   - Drones marcados com `ativa = false` não são exibidos na vitrine pública do e-commerce, permanecendo visíveis apenas para consulta e reativação no painel administrativo.

### 2.4 Fluxo de Campanhas Promocionais
1. Uma promoção possui `percentualDesconto`, `dataInicio` e `dataFim`.
2. A validação de vigência ocorre no momento da visualização e na montagem do pedido:
   $$\text{agora} \ge \text{dataInicio} \quad \text{e} \quad \text{agora} \le \text{dataFim}$$
3. Se a promoção estiver vigente:
   $$\text{precoFinal} = \text{precoOriginal} \times \left(1 - \frac{\text{percentualDesconto}}{100}\right)$$
4. Drones podem ser vinculados ou desvinculados de promoções pela administração a qualquer momento.

### 2.5 Fluxo de Montagem e Criação do Pedido
1. **Pré-requisitos do Cliente**:
   - O cliente deve estar autenticado (`Role: CLIENTE` ou `ADMIN`).
   - O cliente deve possuir `nomeCompleto`, `cpf` preenchido e pelo menos um endereço cadastrado.
2. **Composição dos Itens**:
   - O pedido deve conter pelo menos 1 item (`itens.size() >= 1`).
   - A quantidade de cada item deve ser um número inteiro maior que zero.
3. **Reserva e Baixa de Estoque**:
   - Para cada item, o sistema consulta a `quantidadeDisponivel` do Drone no banco de dados.
   - Se $(\text{quantidadeDisponivel} - \text{item.quantidade}) < 0$, a transação é abortada e uma exceção é lançada informando o estoque insuficiente para o produto.
   - Havendo disponibilidade, a quantidade solicitada é debitada imediatamente do estoque do drone:
     $$\text{quantidadeDisponivel}_{\text{nova}} = \text{quantidadeDisponivel}_{\text{atual}} - \text{quantidadeItem}$$
4. **Congelamento do Preço Unitário**:
   - O preço unitário do item é calculado aplicando-se a promoção ativa (se houver) e gravado em `ItemPedido.precoUnitario`.
   - O valor do item passa a ser imutável, protegendo a compra contra oscilações de preço posteriores no catálogo.
5. **Snapshot do Endereço de Entrega**:
   - O sistema localiza o endereço principal do cliente no momento da compra.
   - Os dados (`rua`, `bairro`, `cidade`, `estado`, `cep`) são copiados para as colunas de entrega da entidade `Pedido`.
   - Desta forma, mesmo que o cliente mude de residência no futuro, o endereço para onde o pedido foi despachado permanece fiel e auditável.
6. **Status Inicial**:
   - O pedido é gravado com status inicial `StatusPedido.PENDENTE`.
   - A data/hora da compra é registrada (`dataPedido = LocalDateTime.now()`).

### 2.6 Fluxo de Pagamento e Liquidação
1. **Exclusividade de Pagamento**:
   - Cada pedido só pode possuir uma tentativa de pagamento ativa (ou PIX ou Cartão). Não é permitida a duplicação de pagamentos para o mesmo pedido.
2. **Validação de Valor**:
   - O valor do pagamento gerado deve ser estritamente idêntico ao `valorTotal` calculado do pedido.
3. **Pagamento via PIX**:
   - Gera uma instância de `PagamentoPix` com status inicial `StatusPagamento.PENDENTE`.
   - Gera uma chave Pix aleatória no formato UUID (`UUID.randomUUID().toString()`) para simular a chave de transferência ou QR Code.
   - Quando a confirmação de recebimento é disparada (`PATCH /pedidos/pagamentos/pix/{id}/pagar`):
     - `pagamentoPix.statusPagamento` passa para `StatusPagamento.APROVADO`.
     - `pedido.statusPedido` passa automaticamente para `StatusPedido.PAGO`.
4. **Pagamento via Cartão de Crédito**:
   - O cliente submete os dados do cartão (número, titular, validade, código de segurança).
   - O sistema valida a presença e coerência dos dados e cria `PagamentoCartao` com status `PENDENTE`.
   - Ao processar a autorização (`PATCH /pedidos/pagamentos/cartao/{id}/pagar`):
     - `pagamentoCartao.statusPagamento` passa para `StatusPagamento.APROVADO`.
     - `pedido.statusPedido` passa para `StatusPedido.PAGO`.
5. **Impedimentos de Pagamento**:
   - Não é permitido pagar um pedido cujo status já seja `PAGO`.
   - Não é permitido pagar um pedido cujo status seja `CANCELADO`.

### 2.7 Fluxo de Cancelamento e Estorno de Estoque
1. **Regras de Cancelamento**:
   - O cliente só pode solicitar cancelamento de seus próprios pedidos.
   - O administrador pode cancelar pedidos de qualquer cliente.
   - Um pedido já cancelado não pode ser cancelado novamente.
2. **Ações Executadas no Cancelamento**:
   - O status do pedido é alterado para `StatusPedido.CANCELADO`.
   - O pagamento associado (seja PIX ou Cartão) tem seu status alterado para `StatusPagamento.CANCELADO`.
   - **Estorno Automático de Estoque**: Todas as unidades de cada item do pedido são devolvidas ao estoque do produto no banco de dados:
     $$\text{drone.quantidadeDisponivel}_{\text{novo}} = \text{drone.quantidadeDisponivel} + \text{item.quantidade}$$
   - A operação é executada sob `@Transactional`, garantindo atomicidade total.

### 2.8 Fluxo de Avaliações e Favoritos
1. **Avaliações**:
   - O cliente deve estar autenticado.
   - A `nota` é de preenchimento obrigatório e deve ser um número inteiro no intervalo $[1, 5]$.
   - O `comentario` textual é opcional, limitado a até 1000 caracteres.
   - A data da avaliação é gerada automaticamente pelo backend (`LocalDateTime.now()`).
   - Apenas o autor da avaliação ou administradores podem editá-la ou excluí-la.
2. **Favoritos**:
   - O cliente autenticado pode marcar um drone como favorito (`POST /favoritos/{droneId}`).
   - Caso o item já esteja favoritado, o sistema preserva o registro existente sem duplicar.
   - A remoção de favoritos (`DELETE /favoritos/{droneId}`) remove a associação daquele usuário com o produto.

---

## 3. Resumo de Validações de Dados (Bean Validation)

| Campo / Entidade | Regra / Expressão Regular | Mensagem de Erro / Comportamento |
| :--- | :--- | :--- |
| `Usuario.email` | `@NotBlank`, `@Email` | Formato válido de email (ex: usuario@dominio.com); campo único |
| `Usuario.cpf` | `^(\d{3}\.\d{3}\.\d{3}-\d{2}\|\d{11})$` | CPF deve estar no formato XXX.XXX.XXX-XX ou conter 11 dígitos; único |
| `Fornecedor.cnpj` | `@NotBlank`, `@CNPJ` | Deve ser um CNPJ válido de acordo com o algoritmo de dígitos verificadores |
| `Fornecedor.nome` | `@Size(min = 3, max = 100)` | Nome da empresa deve ter entre 3 e 100 caracteres |
| `Endereco.cep` | `^\d{5}-?\d{3}$` | CEP deve estar no formato 00000-000 ou 00000000 |
| `Telefone.numero` | `^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$` | Telefone com DDD e 8 ou 9 dígitos (ex: (63) 99999-9999) |
| `Drone.preco` | `preco > 0` | Preço de venda deve ser estritamente positivo |
| `Drone.quantidadeDisponivel` | `quantidadeDisponivel >= 0` | Quantidade em estoque não pode ser negativa |
| `DroneImage` | `count <= 5` por Drone | Limite máximo de 5 imagens por produto |
| `Avaliacao.nota` | `1 <= nota <= 5` | Nota de avaliação deve ser entre 1 e 5 estrelas |
| `Promocao.percentual` | `percentual > 0` e `<= 100` | Percentual de desconto deve ser entre 0% e 100% |
