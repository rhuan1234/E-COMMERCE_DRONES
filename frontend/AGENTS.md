# AGENTS.md - Frontend (Angular 22 & Tailwind CSS 4)

Este documento define as instruções mandatórias, arquitetura, convenções, regras de negócio e procedimentos operacionais para agentes de IA e desenvolvedores que atuam no módulo **Frontend** da plataforma **E-Commerce de Drones**.

---

## 1. Objetivo do Projeto
O frontend do **E-Commerce de Drones** é uma Single Page Application (SPA) moderna, reativa e de alta performance desenvolvida em Angular 22. O sistema é responsável por disponibilizar uma experiência fluida para dois públicos:

1. **Área Administrativa (`/admin`)**:
   - Gestão completa do catálogo de drones, fotos, marcas, modelos e câmeras de alta precisão.
   - Cadastro e manutenção de fornecedores com validação de CNPJ e endereços.
   - Configuração de campanhas promocionais temporais (percentual e intervalo de vigência).
   - Gerenciamento de administradores e perfil próprio.
2. **Área Pública e do Cliente (`/`, `/ecommerce`, `/auth`)**:
   - Vitrine de produtos com galeria de fotos, especificações técnicas, avaliações e preços dinâmicos (com cálculo de desconto promocional).
   - Módulo de autenticação (Login, Cadastro de Cliente, Recuperação de Senha).
   - Gestão de múltiplos endereços e seleção de endereço de entrega principal.
   - Lista de favoritos e submissão de avaliações (nota de 1 a 5 estrelas e comentário).
   - Carrinho de compras reativo e checkout completo (pagamento instantâneo via PIX com Copia-e-Cola e Cartão de Crédito).
   - Acompanhamento do histórico de pedidos e cancelamento com estorno automático.

---

## 2. Stack e Arquitetura

### 2.1 Tecnologias e Bibliotecas Principais
- **Framework SPA**: [Angular](https://angular.dev/) v22.1 (Componentes Standalone, Signals, Router desacoplado).
- **Linguagem**: TypeScript ~6.0.
- **Componentes de UI**: Angular Material v22 (`@angular/material`, `@angular/cdk`) para modais/dialogs, tabelas, formulários, autocomplete, menus, cards e paginadores.
- **Estilização**: Tailwind CSS v4 (`@tailwindcss/postcss`) para design responsivo baseado em classes utilitárias modernas.
- **Gerenciamento Assíncrono & Estado**: Angular Signals (`signal`, `computed`, `effect`) e RxJS 7.8 (`Observable`, `Subject`, `BehaviorSubject`).
- **Runner de Testes**: Vitest (`@vitest/runner`) com JSDOM.
- **Formatação de Código**: Prettier 3.8.

### 2.2 Estrutura e Organização de Pastas (`frontend/src/app/`)
```
frontend/src/app/
├── core/                         # Camada singleton global da aplicação
│   ├── models/                   # Interfaces e types TypeScript espelhando os DTOs do backend
│   │   ├── drone/                # Drone, DroneImagem, DroneFiltroParams
│   │   ├── marca/                # Marca
│   │   ├── modelo/               # Modelo
│   │   ├── camera/               # Camera
│   │   ├── fornecedor/           # Fornecedor
│   │   ├── promocao/             # Promocao
│   │   ├── auth/                 # AuthResponse, LoginRequest, RegisterRequest
│   │   ├── endereco/             # Endereco, Cidade, Estado
│   │   ├── administrador/        # Administrador
│   │   ├── perfil/               # Perfil
│   │   └── PagedResponse.ts      # Contrato de resposta paginada { items, page, pageSize, totalItems, totalPages }
│   ├── resolvers/                # Resolvers de rotas para pré-carregamento de dados (*Resolver.ts)
│   └── services/                 # Serviços HTTP e lógica global de negócio
│       ├── auth/                 # AuthService.ts, AuthGuard.ts, AuthInterceptor.ts
│       ├── DroneService.ts
│       ├── FornecedorService.ts
│       ├── MarcaService.ts
│       ├── ModeloService.ts
│       ├── CameraService.ts
│       ├── PromocaoService.ts
│       ├── EnderecoService.ts
│       └── PerfilService.ts
├── features/                     # Módulos funcionais divididos por contexto
│   ├── admin/                    # Módulo do Painel Administrativo
│   │   ├── layout/               # AdminLayoutComponent com sidebar responsiva e top bar
│   │   └── components/           # Listagens, formulários reativos (*-form) e modais de detalhes
│   ├── auth/                     # Autenticação e credenciamento
│   │   ├── login/                # Tela de Login com validação reativa
│   │   └── register/             # Tela de Cadastro de novos Clientes
│   └── ecommerce/                # Módulo da Loja Virtual e Área do Cliente
│       ├── layout/               # EcommerceLayoutComponent com navbar e footer
│       └── components/           # Home (vitrine de cards), detalhes, carrinho, checkout e pedidos
├── shared/                       # Componentes, diretivas e pipes compartilhados
│   └── components/
│       └── confirm-dialog/       # Diálogo modal reutilizável de confirmação de ações
└── styles.css                    # Folha de estilo raiz (Tailwind @theme e variáveis do Material)
```

---

## 3. Regras de Negócio (Mandatórias no Frontend)

O frontend deve respeitar estritamente as regras de negócio definidas para a plataforma:

1. **Integridade de Marca e Modelo em Formulários**:
   - Em formulários de cadastro/edição de Drones e Câmeras, o campo `Modelo` deve ser filtrado dinamicamente com base na `Marca` selecionada.
   - O usuário não pode submeter uma combinação onde o modelo não pertença à marca escolhida.
2. **Limite e Regras de Upload de Imagens**:
   - Cada drone suporta no máximo **5 imagens**. A interface administrativa de upload deve impedir o envio de mais fotos quando o teto for atingido.
   - Apenas uma imagem pode estar marcada como capa principal. Ao alternar a foto principal, a interface deve desmarcar automaticamente a anterior.
3. **Campanhas Promocionais e Preço**:
   - A exibição de preço com desconto e badge promocional só deve ocorrer se a data atual estiver contida no intervalo de vigência da promoção (`agora >= dataInicio && agora <= dataFim`).
   - O preço final com desconto deve ser calculado pela fórmula: `precoFinal = precoOriginal * (1 - percentualDesconto / 100)`.
4. **Carrinho de Compras e Estoque**:
   - A quantidade máxima permitida de qualquer item no carrinho é limitada pela `quantidadeDisponivel` em estoque.
   - Itens com estoque zerado devem exibir o estado "Esgotado" e ter o botão de compra desabilitado.
5. **Pré-requisitos do Checkout**:
   - Para finalizar uma compra, o cliente deve estar autenticado, possuir `nomeCompleto` e `cpf` cadastrados, e obrigatoriamente ter pelo menos um endereço selecionado para entrega.
   - Formas de pagamento:
     - **PIX**: Deve gerar/exibir a chave Pix Copia-e-Cola e simular ou aguardar a confirmação da transação.
     - **Cartão de Crédito**: Deve validar nome do titular, número do cartão (máscara de 16 dígitos), data de validade (formato MM/AA) e CVV (3 ou 4 dígitos).
6. **Cancelamento de Pedidos**:
   - O cliente só pode solicitar o cancelamento de pedidos que estejam no status `PENDENTE`. Pedidos `PAGO` ou já `CANCELADO` não devem exibir o botão de cancelamento para o cliente.

---

## 4. Convenções de Código

1. **Componentes Standalone e Angular Moderno**:
   - Todos os componentes devem ser Standalone (`standalone: true`), declarando suas dependências diretamente no array `imports: [...]`.
   - Priorize o uso de **Angular Signals** (`signal()`, `computed()`) para reatividade de estado local de componentes, formulários e exibição de carregamento.
2. **Formulários Reativos e Validação**:
   - Use `ReactiveFormsModule` com tipagem estrita para todos os formulários.
   - Campos de identificação brasileira devem seguir padrões de validação e formatação:
     - CPF: regex `^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})$`
     - CNPJ: validação algorítmica de dígitos verificadores
     - CEP: regex `^\d{5}-?\d{3}$`
     - Telefone: regex `^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$`
3. **Consumo de Respostas da API (`backend-response.md`)**:
   - Respostas de sucesso: mapear os dados a partir de `response.data` (para itens unitários ou arrays simples) e `response.meta` (para metadados de paginação).
   - Respostas paginadas: utilizar a interface tipada `PagedResponse<T>` e conectar com o componente `mat-paginator`.
   - Respostas de erro (HTTP 400): capturar o objeto `error` e percorrer o array `error.details` para atribuir as mensagens diretamente aos controles do formulário correspondente via `formControl.setErrors({ serverError: detail.issue })`.
4. **Nomenclatura de Arquivos e Classes**:
   - Componentes: `kebab-case.component.ts` (ou `kebab-case.ts`), com classe em `PascalCaseComponent`.
   - Serviços: `NomeService.ts` ou `nome.service.ts`, com classe `NomeService`.
   - Modelos/Interfaces: `Nome.ts` ou `nome.model.ts`, exportando interfaces em `PascalCase`.
   - Guards e Resolvers funcionais: `authGuard`, `authInterceptor`, `droneResolver`.
5. **Estilização com Tailwind CSS 4**:
   - Evite seletores CSS globais ou inline styles; utilize classes utilitárias do Tailwind CSS.
   - Siga o padrão *mobile-first* com breakpoints responsivos (`sm:`, `md:`, `lg:`, `xl:`).

---

## 5. Testes e Validação

### 5.1 Comandos de Execução
```bash
# Iniciar servidor de desenvolvimento (porta 4200):
npm start

# Executar build de produção para verificar integridade de compilação:
npm run build

# Executar suite completa de testes unitários com Vitest:
npm test

# Executar testes em modo watch iterativo:
npx vitest

# Checar formatação e conformidade de código:
npx prettier --check .
```

### 5.2 Critérios de Aceite
- O comando `npm run build` DEVE compilar com **zero erros** de TypeScript e templates Angular.
- Todos os testes unitários (`npm test`) devem passar com sucesso.
- Telas administrativas e de e-commerce devem ser responsivas e testadas visualmente em resoluções mobile e desktop.
- Diálogos de confirmação (`ConfirmDialogComponent`) devem ser disparados antes de qualquer exclusão destrutiva de dados.
- O token JWT expirado (HTTP 401) deve acionar logout automático com redirecionamento para `/login`.

---

## 6. Fontes de Verdade

Antes de criar componentes, rotas ou modelos, consulte os seguintes documentos:
1. [**`../docs/CONTEXTO_PROJETO.md`**](file:///home/leandro/Programas/unitins/topicos-2/E-COMMERCE_DRONES/docs/CONTEXTO_PROJETO.md): Visão do e-commerce, stack, decisões de arquitetura e roadmap de funcionalidades pendentes.
2. [**`../docs/REGRAS_NEGOCIO.md`**](file:///home/leandro/Programas/unitins/topicos-2/E-COMMERCE_DRONES/docs/REGRAS_NEGOCIO.md): Regras de negócio de cada módulo, restrições e cálculos válidos.
3. [**`../docs/modelo.plantuml`**](file:///home/leandro/Programas/unitins/topicos-2/E-COMMERCE_DRONES/docs/modelo.plantuml): Diagrama de classes PlantUML com a estrutura exata das entidades e seus tipos de dados.
4. [**`frontend/docs/backend-response.md`**](file:///home/leandro/Programas/unitins/topicos-2/E-COMMERCE_DRONES/frontend/docs/backend-response.md): Contrato unificado de formato de respostas JSON (sucesso, erro, paginação) do backend.

---

## 7. Segurança e Limites

1. **Armazenamento de Tokens e Sessão**:
   - O JWT deve ser gerenciado exclusivamente através do `AuthService` e persistido em `localStorage`.
   - O interceptor `authInterceptor` deve anexar o header `Authorization: Bearer <token>` nas requisições aos endpoints protegidos da API.
2. **Proteção de Rotas com Guards**:
   - Rotas sob `/admin/*` devem exigir perfil `ADMIN`.
   - Rotas de checkout, histórico de pedidos e perfil devem ser protegidas pelo `authGuard`.
3. **Tratamento de Sessão Expirada (HTTP 401)**:
   - Em caso de retorno 401 não autorizado, o cliente deve limpar o token do `localStorage`, atualizar o estado de autenticação e redirecionar para `/login`.
4. **Ações Proibidas**:
   - NUNCA armazene dados sensíveis de pagamento (número de cartão, CVV) em `localStorage`, `sessionStorage` ou logs do console.
   - NUNCA confie apenas em validação client-side; exiba sempre o feedback retornado pela API.
   - NUNCA introduza bibliotecas externas pesadas sem avaliar o impacto no bundle final.

---

## 8. Fluxo de Trabalho do Agente

Ao implementar novas telas ou componentes no frontend, siga este fluxo:
1. **Consultar as Fontes de Verdade**: Revise `docs/CONTEXTO_PROJETO.md`, `docs/REGRAS_NEGOCIO.md` e `frontend/docs/backend-response.md`.
2. **Definir Contratos e Interfaces**: Crie ou atualize interfaces TypeScript em `src/app/core/models/` baseadas nos DTOs do backend.
3. **Implementar ou Atualizar Serviços HTTP**: Escreva os métodos no `Service` correspondente em `src/app/core/services/` com tipagem explícita de retorno (`Observable<PagedResponse<T>>`, etc.).
4. **Construir Componentes**: Implemente o componente standalone em `src/app/features/` com formulário reativo, Angular Material e classes utilitárias do Tailwind CSS 4.
5. **Tratar Estados de Interface**: Adicione tratamento para estados de carregamento (spinners/skeletons), mensagens de sucesso e erros mapeados com base no retorno 400 da API.
6. **Escrever Testes Unitários**: Crie testes com Vitest (`*.spec.ts`) para cobrir a renderização e lógica do componente/serviço.
7. **Verificar Build e Testes**: Execute `npm test` e `npm run build` garantindo zero falhas de tipagem.
8. **Atualizar a Documentação**: Atualize o status de progresso das pendências em `docs/CONTEXTO_PROJETO.md`.

---

## 9. Skills e Ferramentas Aplicáveis

- **Skill `modern-web-guidance`**: Consulte para diretrizes atualizadas de UI/Layout, acessibilidade (a11y), Tailwind CSS e boas práticas de formulários e estados assíncronos.
- **Angular CLI**: Utilize para compilação, build e geração de artefatos (`npm start`, `npm run build`).
- **Vitest**: Ferramenta primária para testes unitários rápidos e orientados a feedback contínuo.
- **DevTools do Navegador**: Utilize a aba Network para inspecionar payloads de requisição/resposta, headers JWT e códigos HTTP retornados pelo backend Quarkus.
- **Tailwind CSS 4**: Utilize utilitários modernos para garantir responsividade em todas as telas da plataforma.
