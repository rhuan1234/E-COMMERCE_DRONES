# Estados de Interface, Permissões (RBAC) e Checklist de Revisão

Este documento estabelece o padrão visual e comportamental para os 4 estados obrigatórios de UI, controle de permissões de usuário e o checklist de qualidade e testes para artefatos Angular.

---

## 1. Tratamento dos 4 Estados de Interface

Toda tela ou componente assíncrono (listagens, formulários, detalhes, checkout) deve prever e tratar explicitamente quatro estados:

```
┌─────────────────────────────────────────────────────────────┐
│                   Ciclo de Estados da UI                    │
├──────────────┬──────────────────┬──────────────┬────────────┤
│  Carregando  │     Sucesso      │    Vazio     │    Erro    │
│  (Loading)   │    (Success)     │   (Empty)    │  (Error)   │
└──────────────┴──────────────────┴──────────────┴────────────┘
```

### 1.1 Estado de Carregamento (Loading)
- **Indicadores Visuais**: Utilize `mat-spinner` centralizado ou placeholders/skeletons Tailwind (`animate-pulse bg-slate-200 rounded`).
- **Bloqueio de Interações**: Desabilite botões de envio durante o processamento (`[disabled]="isLoading() || form.invalid"`).
- **Exemplo**:
```html
@if (isLoading()) {
  <div class="flex flex-col items-center justify-center p-12 text-slate-500">
    <mat-spinner diameter="44"></mat-spinner>
    <p class="mt-4 text-sm font-medium">Carregando dados, por favor aguarde...</p>
  </div>
}
```

### 1.2 Estado de Sucesso (Success)
- **Feedback**: Notificação flutuante com `MatSnackBar` (`snack.open('Operação realizada com sucesso!', 'Fechar', { duration: 3000 })`).
- **Navegação**: Em formulários de inclusão/edição, redirecione para a listagem correspondente após a confirmação da API.
- **Tabelas**: Em listagens, atualize a fonte de dados do `MatTableDataSource` e resete a paginação caso necessário.

### 1.3 Estado Vazio (Empty)
- **Apresentação**: Nunca exiba uma tabela sem linhas ou uma tela em branco sem contexto.
- **Elementos Obrigatórios**:
  1. Ícone visual expressivo (`inventory_2`, `search_off`, `sentiment_dissatisfied`).
  2. Título curto e explicativo ("Nenhum registro encontrado").
  3. Texto secundário orientando a ação ("Tente remover filtros ou adicione um novo cadastro").
  4. Botão de ação direta (ex: "Cadastrar Drone" ou "Limpar Filtros").
- **Exemplo**:
```html
@if (!isLoading() && totalItems === 0) {
  <div class="flex flex-col items-center justify-center py-16 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
    <mat-icon class="text-6xl h-16 w-16 text-slate-400 mb-3">inventory_2</mat-icon>
    <h3 class="text-lg font-semibold text-slate-700">Nenhum drone encontrado</h3>
    <p class="text-sm text-slate-500 mt-1 max-w-sm text-center">
      Não há drones cadastrados ou correspondentes aos filtros aplicados.
    </p>
    <button mat-flat-button color="primary" class="mt-4" routerLink="/drones/new">
      <mat-icon>add</mat-icon>
      Novo Drone
    </button>
  </div>
}
```

### 1.4 Estado de Erro (Error)
- **Erros de Validação (400)**: Mapeie os detalhes retornados no formulário reativo com `setErrors({ serverError: issue })`.
- **Sessão Expirada (401)**: Interceptada globalmente com redirecionamento para `/login`.
- **Acesso Negado (403)**: Alerta explicativo indicando que o usuário não possui privilégios de administrador.
- **Não Encontrado (404)**: Mensagem informando que o recurso solicitado não existe mais, com link para retornar à tela inicial.
- **Falha de Servidor (500)**: Notificação com `MatSnackBar` destacando "Falha de comunicação com o servidor. Tente novamente mais tarde."

---

## 2. Controle de Permissões e Perfis (RBAC)

O sistema possui dois perfis principais: `ADMIN` e `CLIENTE`.

### 2.1 Ocultação Condicional de Elementos na UI
```typescript
readonly isAdmin = computed(() => this.authService.hasRole('ADMIN'));
```
No template:
```html
@if (isAdmin()) {
  <button mat-raised-button color="accent" routerLink="/admin/drones">
    Painel de Gestão
  </button>
}
```

### 2.2 Proteção de Rotas com Guards
- Rotas `/admin/*` devem exigir `adminGuard`.
- Rotas `/ecommerce/pedidos`, `/ecommerce/perfil` e `/ecommerce/checkout` devem exigir `authGuard`.

---

## 3. Checklist Completo de Revisão e Qualidade

Antes de concluir qualquer tarefa de frontend, passe rigorosamente por cada item:

### Fase 1: Antes de Codificar (Inspeção Prévia)
- [ ] Inspecionou a pasta `frontend/src/app/` e seus submódulos (`core`, `features`, `shared`).
- [ ] Consultou `frontend/AGENTS.md`, `docs/CONTEXTO_PROJETO.md` e `docs/REGRAS_NEGOCIO.md`.
- [ ] Verificou se o endpoint existe no backend Quarkus (`backend/src/main/java/drones/resources/`).
- [ ] Garantiu que nenhum campo ou endpoint novo será inventado.

### Fase 2: Implementação e Arquitetura
- [ ] Componente declarado com `standalone: true` e dependências isoladas em `imports: [...]`.
- [ ] Utilizou a nova sintaxe de templates (`@if`, `@for`, `@switch`) com `track` obrigatório.
- [ ] Formulários reativos tipados com validações de formatos brasileiros (CPF, CNPJ, CEP).
- [ ] Tratamento explícito dos 4 estados: Loading, Success, Empty e Error.
- [ ] Utilizou `ConfirmDialogComponent` para exclusões e ações destrutivas.
- [ ] Estilização mobile-first com classes utilitárias do Tailwind CSS 4.
- [ ] Acessibilidade e textos em português brasileiro (paginador, labels, botões).

### Fase 3: Validação de Build e Testes
- [ ] Executou `npm run build` na pasta `frontend/` com **ZERO erros** de template e TypeScript.
- [ ] Executou `npm test` garantindo que todos os testes unitários passaram.
- [ ] Nenhuma alteração foi realizada no `backend/` ou no `package.json` sem autorização prévia.
