# Guia de Resolução de Problemas e Injeção de Dependências (Angular 22 + Vitest)

Este guia orienta o diagnóstico e resolução dos erros mais recorrentes encontrados na execução de testes com Angular 22 e Vitest.

---

## 1. 🚨 Erro: `NG0201: No provider found for ActivatedRoute`

### Causa:
Ocorre quando um componente standalone (ou um de seus imports, como `RouterLink`) injeta o serviço de roteamento, mas o módulo de teste não proveu as dependências de rota.

### Sintoma no Log:
```text
ɵNotFound: NG0201: No provider found for `ActivatedRoute`. Source: Standalone[_PerfilPage].
```

### Como Corrigir:
Adicione `provideRouter([])` no array de `providers` do `TestBed`:
```typescript
import { provideRouter } from '@angular/router';

await TestBed.configureTestingModule({
  imports: [MeuComponente],
  providers: [
    provideRouter([]) // <-- Resolve a dependência de ActivatedRoute e RouterLink
  ]
}).compileComponents();
```

Caso o componente leia parâmetros de rota (`route.snapshot.paramMap.get('id')`), configure um stub ou use `provideRouter`:
```typescript
import { ActivatedRoute } from '@angular/router';

providers: [
  {
    provide: ActivatedRoute,
    useValue: {
      snapshot: {
        paramMap: {
          get: (key: string) => (key === 'id' ? '123' : null)
        }
      }
    }
  }
]
```

---

## 2. 🚨 Erro: `NG0201: No provider found for HttpClient`

### Causa:
O componente ou serviço faz requisições HTTP, mas o cliente HTTP de teste não foi configurado no `TestBed`.

### Como Corrigir:
No Angular 22 (Standalone APIs), utilize `provideHttpClient()` e `provideHttpClientTesting()`:
```typescript
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

TestBed.configureTestingModule({
  providers: [
    provideHttpClient(),
    provideHttpClientTesting()
  ]
});
```

---

## 3. 🚨 Erro de Animações do Angular Material

### Causa:
Componentes do Material (`mat-select`, `mat-dialog`, `mat-expansion-panel`, `mat-menu`) disparam animações de abertura/fechamento que quebram ou tornam os testes instáveis se o provedor de animações não for incluído.

### Como Corrigir:
Sempre adicione `provideNoopAnimations()` aos `providers`:
```typescript
import { provideNoopAnimations } from '@angular/platform-browser/animations';

TestBed.configureTestingModule({
  providers: [
    provideNoopAnimations()
  ]
});
```

---

## 4. 🚨 Componente Preso em Estado "Carregando..."

### Causa:
O teste faz asserções logo após chamar um método assíncrono antes que o Observable ou Signal tenha completado seu ciclo e o Angular tenha atualizado a árvore de renderização.

### Sintoma:
```text
AssertionError: expected '...Carregando informações...' to contain 'Drone DJI'
```

### Como Corrigir:
1. **Garanta que o Mock Retorne Imediatamente**: Utilize `of(valor)` para observables síncronos na inicialização.
2. **Ciclo de Atualização do DOM**: Execute `fixture.detectChanges()` e aguarde o término das microtarefas com `await fixture.whenStable()`:
   ```typescript
   fixture.detectChanges();
   await fixture.whenStable();
   fixture.detectChanges(); // Garante a renderização final pós-resolução
   ```
3. **Se usar Signals**: Alterações em `signal.set(...)` exigem um `fixture.detectChanges()` subsequente para que o template renderize a nova projeção.

---

## 5. 🚨 `ReferenceError: describe is not defined` ao rodar `npx vitest run`

### Causa:
No Angular 22 com `@angular/build:unit-test`, o Vitest depende da infraestrutura de build do Angular CLI para compilar os templates, resolver os módulos TypeScript e carregar as APIs globais de teste (`describe`, `it`, `expect`). Rodar o binário `npx vitest run` diretamente sem o builder do Angular ignora esse pipeline.

### Como Corrigir:
Sempre execute os testes através do executor do Angular CLI:
```bash
# Executar todos os testes:
npm test -- --watch=false

# Executar um teste isolado:
npx ng test --watch=false --include="**/nome-do-componente.spec.ts"
```

---

## 6. 🚨 Vazamento de Estado entre Testes (Test Pollution)

### Causa:
Spies criados com `vi.fn()` ou `vi.spyOn()` mantêm contadores de chamadas (`toHaveBeenCalledTimes`) ou implementações mockadas acumuladas de testes anteriores no mesmo arquivo.

### Como Corrigir:
Limpe e resete os mocks no hook `beforeEach`:
```typescript
import { vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.clearAllMocks(); // Reseta histórico de chamadas
  // ou
  vi.resetAllMocks(); // Reseta implementações e retornos
});
```
E se o teste manipular o `localStorage`:
```typescript
beforeEach(() => {
  localStorage.clear();
});
```
