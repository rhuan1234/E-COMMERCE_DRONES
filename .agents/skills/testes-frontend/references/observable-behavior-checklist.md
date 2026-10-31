# Checklist das 12 Dimensões de Comportamento Observável

Este documento detalha a matriz obrigatória de validação para testes de frontend. O foco deve ser estritamente no que é **observável** pelo usuário final ou por sistemas externos, evitando testes frágeis acoplados a detalhes de implementação interna.

---

## 1. 🖼️ Renderização Inicial (Rendering)
- **O que observar**:
  - Elementos estruturais essenciais renderizados no DOM (`<header>`, `<table-container>`, `<form>`, `<mat-card>`).
  - Títulos da página, subtítulos e labels acessíveis.
  - Exibição correta de dados iniciais passados via Inputs ou Signals.
  - Aplicação de classes utilitárias condicionalmente (ex: classes de status, destaque ou badge promocional com Tailwind CSS).
- **Exemplo de Asserção**:
  ```typescript
  expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Gerenciamento de Drones');
  expect(fixture.nativeElement.querySelector('[data-testid="badge-promocao"]')).toBeTruthy();
  ```

---

## 2. 🖱️ Interação do Usuário (Interaction)
- **O que observar**:
  - Resposta a eventos do usuário: cliques em botões, preenchimento de campos de texto, seleção em dropdowns (`mat-select`), checkboxes e links de ação.
  - Atualização do DOM imediata após a ação.
  - Disparo de diálogos modais de confirmação (`ConfirmDialogComponent`) em ações destrutivas (excluir item).
- **Exemplo de Asserção**:
  ```typescript
  const deleteBtn = fixture.nativeElement.querySelector('[data-testid="btn-excluir"]');
  deleteBtn.click();
  fixture.detectChanges();
  expect(dialogService.open).toHaveBeenCalledWith(ConfirmDialogComponent, expect.anything());
  ```

---

## 3. ✍️ Validações de Formulário (Form Validation)
- **O que observar**:
  - Desabilitação do botão de submissão enquanto o formulário possuir campos obrigatórios não preenchidos (`form.invalid`).
  - Exibição de mensagens visuais de erro (`<mat-error>`, textos de aviso) quando o campo for tocado (`touched`) ou submetido.
  - Validação estrita de formatos brasileiros:
    - **CPF**: `999.999.999-99` ou 11 dígitos numéricos.
    - **CNPJ**: Validação algorítmica de dígitos verificadores e formato `99.999.999/9999-99`.
    - **CEP**: `99999-999` ou 8 dígitos.
    - **Telefone**: `(99) 99999-9999` ou `(99) 9999-9999`.
  - Validações de negócio cruzadas (ex: `Modelo` deve pertencer à `Marca` selecionada; no máximo 5 fotos de drone cadastradas).
- **Exemplo de Asserção**:
  ```typescript
  const cpfControl = component.form.get('cpf');
  cpfControl?.setValue('123'); // inválido
  cpfControl?.markAsTouched();
  fixture.detectChanges();

  const matError = fixture.nativeElement.querySelector('mat-error');
  expect(matError?.textContent).toContain('CPF inválido');
  ```

---

## 4. 🌐 Chamadas HTTP (HTTP Requests)
- **O que observar**:
  - Disparo da requisição HTTP com o método semântico exato (GET, POST, PUT, DELETE, PATCH).
  - URL completa e correta com query params de paginação (`?page=0&size=10`) e filtros.
  - Payload JSON de envio estruturado de acordo com os DTOs do backend (`backend/AGENTS.md`).
  - Presença de cabeçalhos esperados (`Content-Type: application/json`).
- **Exemplo de Asserção**:
  ```typescript
  const req = httpMock.expectOne('/api/drones?page=0&size=10');
  expect(req.request.method).toBe('GET');
  req.flush(mockPagedResponse);
  ```

---

## 5. ✅ Fluxos de Sucesso (Success Handling)
- **O que observar**:
  - Atualização visual da tabela ou lista com os novos dados recebidos em `response.data`.
  - Exibição de notificação amigável de sucesso (`MatSnackBar` ou mensagem de toast).
  - Fechamento de modal ou diálogo de edição/criação após salvar.
  - Redefinição ou limpeza do formulário quando aplicável (`form.reset()`).
- **Exemplo de Asserção**:
  ```typescript
  salvarButton.click();
  fixture.detectChanges();
  await fixture.whenStable();

  expect(snackBar.open).toHaveBeenCalledWith('Drone salvo com sucesso!', expect.anything(), expect.anything());
  expect(dialogRef.close).toHaveBeenCalled();
  ```

---

## 6. ❌ Fluxos de Erro da API (Error Handling)
- **O que observar**:
  - Respostas HTTP 400 (Bad Request com `error.code = VALIDATION_ERROR` e array `error.details`): cada erro deve ser mapeado de volta ao campo do formulário (`setErrors({ serverError: issue })`), tornando o campo visualmente inválido no formulário.
  - Respostas HTTP 404 / 500: exibição de mensagem de alerta amigável e acessível para o usuário, sem quebrar a aplicação ou deixá-la travada em tela branca.
- **Exemplo de Asserção**:
  ```typescript
  const errorPayload = {
    success: false,
    message: 'Dados inválidos.',
    error: {
      code: 'VALIDATION_ERROR',
      details: [{ field: 'preco', issue: 'O preço deve ser positivo.' }]
    }
  };
  req.flush(errorPayload, { status: 400, statusText: 'Bad Request' });
  fixture.detectChanges();

  expect(component.form.get('preco')?.hasError('serverError')).toBe(true);
  expect(fixture.nativeElement.querySelector('mat-error')?.textContent).toContain('O preço deve ser positivo.');
  ```

---

## 7. ⏳ Estado de Carregamento (Loading State)
- **O que observar**:
  - Renderização de spinners de progresso (`<mat-progress-spinner>`), barras de carregamento ou skeletons enquanto a requisição assíncrona estiver pendente.
  - Botões de ação primária (salvar, confirmar, comprar) desabilitados com `disabled="true"` durante o carregamento.
  - Desaparecimento do spinner e reabilitação dos botões após a conclusão da requisição (seja sucesso ou falha).
- **Exemplo de Asserção**:
  ```typescript
  expect(fixture.nativeElement.querySelector('mat-progress-spinner')).toBeTruthy();
  expect(submitButton.disabled).toBe(true);

  req.flush(mockResponse);
  fixture.detectChanges();

  expect(fixture.nativeElement.querySelector('mat-progress-spinner')).toBeFalsy();
  ```

---

## 8. 📭 Estado Vazio (Empty State)
- **O que observar**:
  - Quando a consulta à API retornar zero itens (`data: []`), a tabela não deve permanecer vazia sem feedback visual.
  - Deve ser renderizado um componente de estado vazio com ilustração ou ícone, mensagem descritiva (ex: "Nenhum drone encontrado com os filtros aplicados") e botão de ação alternativa quando aplicável (ex: "Limpar filtros" ou "Cadastrar Drone").
- **Exemplo de Asserção**:
  ```typescript
  expect(fixture.nativeElement.querySelector('[data-testid="empty-state"]')?.textContent).toContain(
    'Nenhum registro encontrado'
  );
  ```

---

## 9. 🗺️ Navegação (Navigation & Routing)
- **O que observar**:
  - Transição de rota acionada após conclusão bem-sucedida de fluxos (ex: após login -> `/admin/drones` ou `/ecommerce`).
  - Navegação de cancelamento retornando para a lista anterior.
  - Links de navegação no menu com `routerLinkActive` aplicando classes de destaque.
- **Exemplo de Asserção**:
  ```typescript
  expect(router.navigate).toHaveBeenCalledWith(['/admin/drones']);
  ```

---

## 10. 🛡️ Autorização e Guards (Authorization & Guards)
- **O que observar**:
  - Usuário não autenticado tentando acessar rota restrita -> redirecionado para `/login`.
  - Usuário com role `CLIENTE` tentando acessar rota `/admin/*` -> acesso negado e redirecionamento para rota pública ou página 403.
  - Usuário com role `ADMIN` -> navegação permitida.
- **Exemplo de Asserção**:
  ```typescript
  const canActivate = TestBed.runInInjectionContext(() =>
    authGuard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
  );
  expect(canActivate).toBe(false);
  expect(router.navigate).toHaveBeenCalledWith(['/login']);
  ```

---

## 11. ⏱️ Sessão Expirada (Session Expiration - HTTP 401)
- **O que observar**:
  - `authInterceptor` anexa o cabeçalho `Authorization: Bearer <token>` em requisições para a API quando o token existir.
  - Quando o backend responde com HTTP 401:
    - O token é removido do `localStorage`.
    - O estado reativo de autenticação no `AuthService` é atualizado para não autenticado (`currentUser = null`).
    - O usuário é redirecionado para `/login`.
    - Mensagem explicativa ("Sessão expirada. Faça login novamente") é exibida.
- **Exemplo de Asserção**:
  ```typescript
  // Simula resposta 401
  httpClient.get('/api/admin/drones').subscribe({ error: () => {} });
  const req = httpMock.expectOne('/api/admin/drones');
  req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

  expect(localStorage.getItem('token')).toBeNull();
  expect(router.navigate).toHaveBeenCalledWith(['/login']);
  ```

---

## 12. 🛑 Prevenção de Envio Duplicado (Double Submit Prevention)
- **O que observar**:
  - Cliques múltiplos e rápidos no botão de submissão não disparam múltiplas requisições HTTP simultâneas.
  - A flag interna de carregamento (`loading()` ou `isSubmitting`) bloqueia reentradas na função de envio.
  - O botão de envio no DOM ganha o atributo `disabled` logo após o primeiro clique.
- **Exemplo de Asserção**:
  ```typescript
  const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]');
  submitBtn.click();
  submitBtn.click();
  submitBtn.click();

  // Apenas uma requisição HTTP deve ser aberta
  const requests = httpMock.match('/api/drones');
  expect(requests.length).toBe(1);
  ```
