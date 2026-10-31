# Padrões de Componentes Standalone, UI Material e Tailwind CSS

Este documento detalha as convenções e práticas recomendadas para a construção e revisão de componentes standalone em Angular 22, integrados ao Angular Material e Tailwind CSS 4 na plataforma E-Commerce de Drones.

---

## 1. Estrutura de Componentes Standalone

Todos os componentes do projeto devem ser declarados com `standalone: true` e gerenciar suas próprias dependências no array `imports`. Não utilize `NgModules`.

### Anatomia Básica de um Componente Standalone
```typescript
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-drone-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './drone-card.component.html',
  styleUrl: './drone-card.component.css'
})
export class DroneCardComponent implements OnInit {
  private readonly router = inject(Router);

  // Signals para reatividade
  readonly drone = signal<Drone | null>(null);
  readonly precoFormatado = computed(() => {
    const d = this.drone();
    return d ? `R$ ${d.preco.toFixed(2)}` : 'R$ 0,00';
  });

  ngOnInit(): void {
    // Inicialização do componente
  }
}
```

---

## 2. Reatividade Moderna com Angular Signals

Priorize **Angular Signals** (`signal`, `computed`, `effect`) para gerenciar o estado local dos componentes, indicadores de carregamento e valores derivados.

### Diretrizes de Uso
1. **Estado Mutável**: Utilize `signal<T>(valorInicial)` para estados locais que mudam com ações do usuário (ex: `isLoading = signal(false)`, `filtroAtivo = signal('')`).
2. **Valores Derivados**: Utilize `computed(() => ...)` para valores calculados a partir de outros signals. O `computed` é memoizado e reavalia apenas quando suas dependências mudam.
3. **Efeitos Colaterais**: Utilize `effect(() => ...)` apenas quando precisar de sincronização externa explícita (ex: persistência em storage, logging).
4. **Integração com RxJS**: Quando consumir Observables de serviços HTTP, você pode usar `toSignal(observable$, { initialValue: [] })` para converter fluxos em signals declarativos no template, ou assinar via `.subscribe()` com tratamento dos 4 estados.

---

## 3. Nova Sintaxe de Controle de Fluxo nos Templates

Substitua as diretivas legadas (`*ngIf`, `*ngFor`, `*ngSwitch`) pela nova sintaxe nativa do Angular (`@if`, `@for`, `@switch`), que oferece melhor legibilidade, performance e type-checking estrito.

### Condicional (@if / @else if / @else)
```html
@if (isLoading()) {
  <div class="flex justify-center p-8">
    <mat-spinner diameter="40"></mat-spinner>
  </div>
} @else if (temErro()) {
  <div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
    <p>{{ mensagemErro() }}</p>
  </div>
} @else {
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Conteúdo principal -->
  </div>
}
```

### Iteração (@for com track obrigatório e bloco @empty)
```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  @for (drone of drones(); track drone.id) {
    <mat-card class="hover:shadow-lg transition-shadow duration-200">
      <mat-card-header>
        <mat-card-title>{{ drone.nome }}</mat-card-title>
        <mat-card-subtitle>{{ drone.marca?.nome }} - {{ drone.modelo?.nome }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content class="pt-4">
        <p class="text-xl font-bold text-sky-700">R$ {{ drone.preco.toFixed(2) }}</p>
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-button color="primary" [routerLink]="['/drones', drone.id]">Detalhes</button>
      </mat-card-actions>
    </mat-card>
  } @empty {
    <div class="col-span-full text-center py-12 text-slate-500">
      <mat-icon class="text-5xl h-12 w-12 text-slate-400 mb-2">inventory_2</mat-icon>
      <p class="text-lg font-medium">Nenhum drone encontrado.</p>
      <p class="text-sm">Tente ajustar seus filtros de busca.</p>
    </div>
  }
</div>
```

---

## 4. Integração com Angular Material v22

O Angular Material fornece componentes de acessibilidade e interação complexa. Siga os padrões estabelecidos no projeto:

### Componentes Mais Utilizados
- **Tabelas**: `MatTableModule` combinado com `MatPaginatorModule` e `MatSortModule`. Sempre forneça `displayedColumns` explícito e use `MatTableDataSource<T>`.
- **Formulários**: `MatFormFieldModule`, `MatInputModule`, `MatSelectModule`, `MatCheckboxModule`. Configure `appearance="outline"` para consistência visual.
- **Feedback e Diálogos**: `MatSnackBarModule` para mensagens temporárias e `MatDialogModule` para confirmações e formulários modais.
- **Ações e Ícones**: `MatButtonModule`, `MatIconButton`, `MatIconModule`.

### Paginação em Português
Sempre utilize a internacionalização de paginador configurada em `frontend/src/app/shared/custom-paginator-intl.ts` para garantir que termos como "Itens por página", "Página seguinte" e "Página anterior" estejam traduzidos.

---

## 5. Layout e Estilização com Tailwind CSS 4

O projeto utiliza **Tailwind CSS 4** para layout responsivo, espaçamentos, tipografia e cores utilitárias.

### Convenções de Estilização
1. **Design Mobile-First**: Inicie estilizandos para telas pequenas e adicione breakpoints progressivos (`sm:`, `md:`, `lg:`, `xl:`).
2. **Grid e Flexbox**:
   - Para cards e vitrines: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`.
   - Para barras de topo e ações: `flex flex-col sm:flex-row justify-between items-center gap-4`.
3. **Evite CSS Customizado Redundante**: Só crie regras em arquivos `.css` locais quando o componente exigir personalização de seletores internos do Angular Material (ex: sobrescrever margens de `::ng-deep .mat-mdc-table` quando estritamente necessário).
4. **Hierarquia Tipográfica**:
   - Títulos de página: `text-2xl font-bold text-slate-800`.
   - Subtítulos: `text-sm text-slate-500`.
   - Preços e destaque: `text-xl font-semibold text-emerald-600`.

---

## 6. Padrão de Confirmação para Ações Destrutivas

Antes de executar qualquer exclusão ou alteração irreversível de dados, abra o modal de confirmação reutilizável:

```typescript
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';

export class MinhaListaComponent {
  private readonly dialog = inject(MatDialog);
  private readonly meuService = inject(MeuService);
  private readonly snack = inject(MatSnackBar);

  confirmarExclusao(id: number, nome: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Confirmar Exclusão',
        mensagem: `Tem certeza de que deseja excluir o item "${nome}"? Esta ação não pode ser desfeita.`
      }
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.meuService.delete(id).subscribe({
          next: () => {
            this.snack.open('Item excluído com sucesso!', 'Fechar', { duration: 3000 });
            this.carregarDados();
          },
          error: (err) => {
            this.snack.open('Erro ao excluir item. Tente novamente.', 'Fechar', { duration: 5000 });
          }
        });
      }
    });
  }
}
```
