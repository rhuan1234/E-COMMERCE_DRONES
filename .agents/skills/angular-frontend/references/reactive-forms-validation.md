# Validação de Formulários Reativos e Regras de Domínio

Este documento define os padrões para implementação de formulários reativos tipados, validações síncronas/assíncronas de formatos brasileiros, regras de integridade do negócio e mapeamento de erros retornados pela API Quarkus.

---

## 1. Formulários Reativos Tipados (`ReactiveFormsModule`)

Todos os formulários devem ser construídos com `ReactiveFormsModule`, utilizando tipagem explícita para evitar valores `undefined` inesperados e garantir segurança em tempo de compilação.

### Estrutura Padrão de Inicialização de Formulário
```typescript
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-drone-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './drone-form.html',
  styleUrl: './drone-form.css'
})
export class DroneFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);

  readonly form: FormGroup = this.fb.group({
    id: [null],
    nome: ['', [Validators.required, Validators.pattern(/\S/), Validators.minLength(2), Validators.maxLength(100)]],
    preco: [null, [Validators.required, Validators.min(0.01)]],
    quantidadeDisponivel: [0, [Validators.required, Validators.min(0)]],
    marcaId: [null, [Validators.required]],
    modeloId: [{ value: null, disabled: true }, [Validators.required]],
    fornecedorId: [null, [Validators.required]],
    possuiGPS: [false]
  });

  ngOnInit(): void {
    this.configurarSelecaoEncadeada();
  }
}
```

---

## 2. Validações de Formatos Brasileiros

Validações de campos específicos de identificação nacional devem ser aplicadas tanto no frontend quanto no backend:

### 2.1 CPF (Cadastro de Pessoas Físicas)
- **Regex de Formato**: `/^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})$/`
- **Validador Customizado**:
```typescript
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = control.value;
    if (!raw) return null;

    const cpf = raw.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return { cpfInvalido: true };
    }

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i), 10) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9), 10)) return { cpfInvalido: true };

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i), 10) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10), 10)) return { cpfInvalido: true };

    return null;
  };
}
```

### 2.2 CNPJ (Cadastro Nacional da Pessoa Jurídica)
- **Regex de Formato**: `/^(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14})$/`
- Deve validar os 2 dígitos verificadores através do cálculo com os multiplicadores 5,4,3,2,9,8,7,6,5,4,3,2.

### 2.3 CEP e Telefone
- **CEP**: `/^\d{5}-?\d{3}$/`
- **Telefone**: `/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/`

---

## 3. Seleção Dependente / Encadeada (Marca -> Modelo)

Quando uma entidade depender de outra (ex: o campo `Modelo` pertence a uma `Marca`), o formulário deve manter o controle dependente desabilitado até que a chave pai seja selecionada:

```typescript
configurarSelecaoEncadeada(): void {
  this.form.get('marcaId')?.valueChanges.subscribe((marcaId: number | null) => {
    const modeloCtrl = this.form.get('modeloId');
    if (marcaId) {
      modeloCtrl?.enable();
      modeloCtrl?.setValue(null);
      this.carregarModelosPorMarca(marcaId);
    } else {
      modeloCtrl?.disable();
      modeloCtrl?.setValue(null);
      this.modelosFiltrados = [];
    }
  });
}
```

---

## 4. Limites e Regras de Domínio em Formulários

Siga estritamente as regras documentadas em `docs/REGRAS_NEGOCIO.md`:

1. **Limite de Imagens (Drones)**:
   - Máximo de **5 imagens** por drone.
   - A interface deve desabilitar o botão de upload assim que 5 fotos forem vinculadas.
   - Apenas uma imagem pode ser definida como capa principal (`principal = true`). Ao selecionar uma nova foto como capa, desmarque a anterior.
2. **Preço e Desconto Promocional**:
   - `preco` não pode ser negativo ou zero.
   - `percentualDesconto` em promoções deve ser um valor entre 1 e 99.
   - A vigência da promoção exige `dataFim` posterior a `dataInicio`.
3. **Carrinho e Estoque**:
   - O campo de quantidade em itens de pedido nunca pode exceder o estoque disponível (`quantidadeDisponivel`).

---

## 5. Mapeamento de Erros da API nos Controles (`HTTP 400`)

Conforme padronizado em `frontend/docs/backend-response.md`, a API Quarkus retorna erros de validação no formato:
```json
{
  "success": false,
  "message": "Os dados informados são inválidos.",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      { "field": "preco", "issue": "O preço deve ser maior que zero." },
      { "field": "nome", "issue": "O nome já está em uso." }
    ]
  }
}
```

### Função Auxiliar para Mapear Erros nos Controles do Form
```typescript
aplicarErrosDaApiNoForm(form: FormGroup, errorResponse: any): void {
  const details = errorResponse?.error?.details;
  if (Array.isArray(details)) {
    details.forEach((item: { field: string; issue: string }) => {
      const control = form.get(item.field);
      if (control) {
        control.setErrors({ serverError: item.issue });
        control.markAsTouched();
      }
    });
  }
}
```

### Exibição Visual no Template Angular Material
```html
<mat-form-field appearance="outline" class="w-full">
  <mat-label>Nome do Drone</mat-label>
  <input matInput formControlName="nome" placeholder="Ex: Phantom Pro 4K">
  
  @if (form.get('nome')?.invalid && (form.get('nome')?.touched || form.get('nome')?.dirty)) {
    <mat-error>
      @if (form.get('nome')?.hasError('required')) {
        O nome é obrigatório.
      } @else if (form.get('nome')?.hasError('minlength')) {
        O nome deve ter no mínimo 2 caracteres.
      } @else if (form.get('nome')?.hasError('serverError')) {
        {{ form.get('nome')?.getError('serverError') }}
      }
    </mat-error>
  }
</mat-form-field>
```
