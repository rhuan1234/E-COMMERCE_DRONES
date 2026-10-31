import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnderecoService } from '../../../../core/services/EnderecoService';
import { EnderecoApiService } from '../../../../core/services/EnderecoApiService';
import { MatDialog } from '@angular/material/dialog';
import { Endereco } from '../../../../core/models/endereco/Endereco';
import { PagedResponse } from '../../../../core/services/DroneService';
import { EnderecoRequest } from '../../../../core/models/endereco/EnderecoRequest';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  selector: 'app-enderecos-page',
  styleUrl: './enderecos-page.css',
  templateUrl: './enderecos-page.html',
})
export class EnderecosPage implements OnInit {

  private readonly fb = inject(FormBuilder);

  private readonly enderecoApi = inject(EnderecoApiService);

  private readonly cepService = inject(EnderecoService);

  private readonly dialog = inject(MatDialog);

  private readonly changeDetector = inject(ChangeDetectorRef);

  enderecos: Endereco[] = [];
  carregandoEnderecos = false;
  salvandoEndereco = false;
  buscandoCep = false;
  processandoEndereco = false;
  mensagemEndereco = '';
  erroEndereco = '';
  editandoEnderecoId: number | null = null;
  mostrarFormularioEndereco = false;
  enderecoForm = this.fb.group({
    rua: [
      '',
      [
        Validators.required,
        Validators.pattern(/\S/),
        Validators.maxLength(120)
      ]
    ],

    bairro: [
      '',
      [
        Validators.required,
        Validators.pattern(/\S/),
        Validators.maxLength(80)
      ]
    ],

    cidade: [
      '',
      [
        Validators.required,
        Validators.pattern(/\S/),
        Validators.maxLength(80)
      ]
    ],

    estado: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[A-Za-zÀ-ÿ]{2}$/)
      ]
    ],

    cep: [
      '',
      [
        Validators.required,
        Validators.pattern(/^\d{5}-?\d{3}$/)
      ]
    ],

    principal: [false]
  });

  ngOnInit(): void {
    this.carregarEnderecos();
  }

  carregarEnderecos(): void {
    this.carregandoEnderecos = true;
    this.erroEndereco = '';

    this.enderecoApi.listar(0, 100).subscribe({
      next: (resposta: PagedResponse<Endereco>) => {
        this.enderecos = resposta.items;
        this.carregandoEnderecos = false;

        this.changeDetector.markForCheck();
      },

      error: (erro) => {
        console.error('Erro ao carregar endereços:', erro);

        this.erroEndereco = 'Não foi possível carregar os endereços.';
        this.carregandoEnderecos = false;

        this.changeDetector.markForCheck();
      }
    });
  }

  buscarCep(): void {
    const controleCep = this.enderecoForm.controls.cep;
    const cep = controleCep.value ?? '';

    if (controleCep.invalid) {
      controleCep.markAsTouched();
      return;
    }

    this.buscandoCep = true;
    this.erroEndereco = '';

    this.cepService.buscarCep(cep).subscribe({
      next: (resposta) => {
        this.buscandoCep = false;

        if (resposta.erro) {
          this.erroEndereco = 'CEP não encontrado.';
          this.changeDetector.markForCheck();
          return;
        }

        this.enderecoForm.patchValue({
          rua: resposta.logradouro ?? '',
          bairro: resposta.bairro ?? '',
          cidade: resposta.localidade ?? '',
          estado: resposta.uf ?? ''
        });

        this.changeDetector.markForCheck();
      },

      error: (erro) => {
        console.error('Erro ao consultar CEP:', erro);

        this.buscandoCep = false;
        this.erroEndereco = 'Não foi possível consultar o CEP.';

        this.changeDetector.markForCheck();
      }
    });
  }

  novoEndereco(): void {
    this.editandoEnderecoId = null;

    this.mensagemEndereco = '';
    this.erroEndereco = '';

    this.enderecoForm.reset({
      rua: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      principal: this.enderecos.length === 0
    });

    this.mostrarFormularioEndereco = true;
  }

  editarEndereco(endereco: Endereco): void {
    this.editandoEnderecoId = endereco.id;

    this.mensagemEndereco = '';
    this.erroEndereco = '';

    this.enderecoForm.patchValue({
      rua: endereco.rua,
      bairro: endereco.bairro,
      cidade: endereco.cidade.nome,
      estado: endereco.cidade.estado.nome,
      cep: endereco.cep,
      principal: endereco.principal
    });

    this.mostrarFormularioEndereco = true;
  }

  salvarEndereco(): void {
    if (this.enderecoForm.invalid || this.salvandoEndereco) {
      this.enderecoForm.markAllAsTouched();
      return;
    }

    const form = this.enderecoForm.getRawValue();

    const dados: EnderecoRequest = {
      rua: form.rua!,
      bairro: form.bairro!,

      cidade: {
        nome: form.cidade!,

        estado: {
          nome: form.estado!
        }
      },

      cep: form.cep!.replace(/\D/g, ''),

      principal: form.principal ?? false
    };

    this.salvandoEndereco = true;

    this.erroEndereco = '';
    this.mensagemEndereco = '';

    const requisicao = this.editandoEnderecoId === null
      ? this.enderecoApi.adicionar(dados)
      : this.enderecoApi.editar(this.editandoEnderecoId, dados);

    requisicao.subscribe({
      next: () => {
        this.salvandoEndereco = false;

        this.mensagemEndereco = this.editandoEnderecoId === null
          ? 'Endereço cadastrado com sucesso!'
          : 'Endereço atualizado com sucesso!';

        this.editandoEnderecoId = null;
        this.mostrarFormularioEndereco = false;

        this.enderecoForm.reset({
          rua: '',
          bairro: '',
          cidade: '',
          estado: '',
          cep: '',
          principal: false
        });

        this.changeDetector.markForCheck();

        this.carregarEnderecos();
      },

      error: (erro) => {
        console.error('Erro ao salvar endereço:', erro);

        this.erroEndereco = 'Não foi possível salvar o endereço.';
        this.salvandoEndereco = false;

        this.changeDetector.markForCheck();
      }
    });
  }

  definirEnderecoPrincipal(endereco: Endereco): void {
    const dados: EnderecoRequest = {
      rua: endereco.rua,
      bairro: endereco.bairro,

      cidade: {
        nome: endereco.cidade.nome,

        estado: {
          nome: endereco.cidade.estado.nome
        }
      },

      cep: endereco.cep.replace(/\D/g, ''),

      principal: true
    };

    this.erroEndereco = '';
    this.mensagemEndereco = '';
    this.processandoEndereco = true;

    this.enderecoApi.editar(endereco.id, dados).subscribe({
      next: () => {
        this.processandoEndereco = false;

        this.mensagemEndereco = 'Endereço principal atualizado.';

        this.changeDetector.markForCheck();
        this.carregarEnderecos();
      },

      error: (erro) => {
        console.error('Erro ao definir endereço principal:', erro);

        this.erroEndereco = 'Não foi possível definir o endereço principal.';
        this.processandoEndereco = false;

        this.changeDetector.markForCheck();
      }
    });
  }

  excluirEndereco(endereco: Endereco): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir endereço',
        mensagem: `Deseja realmente apagar o endereço "${endereco.rua}"?`
      }
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (!confirmado || this.processandoEndereco) {
        return;
      }

      this.processandoEndereco = true;

      this.erroEndereco = '';
      this.mensagemEndereco = '';

      this.enderecoApi.remover(endereco.id).subscribe({
        next: () => {
          this.processandoEndereco = false;

          this.mensagemEndereco = 'Endereço removido com sucesso.';

          this.changeDetector.markForCheck();
          this.carregarEnderecos();
        },

        error: (erro) => {
          console.error('Erro ao excluir endereço:', erro);

          this.erroEndereco = 'Não foi possível excluir o endereço.';
          this.processandoEndereco = false;

          this.changeDetector.markForCheck();
        }
      });
    });
  }

  cancelarEdicaoEndereco(): void {
    this.editandoEnderecoId = null;
    this.mostrarFormularioEndereco = false;

    this.enderecoForm.reset({
      rua: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      principal: false
    });

    this.mensagemEndereco = '';
    this.erroEndereco = '';
  }
}