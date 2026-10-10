import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PerfilService } from '../../../../core/services/PerfilService';
import { Endereco } from '../../../../core/models/endereco/Endereco';
import { EnderecoRequest } from '../../../../core/models/endereco/EnderecoRequest';
import { PagedResponse } from '../../../../core/models/PagedResponse';
import { EnderecoApiService } from '../../../../core/services/EnderecoApiService';
import { EnderecoService } from '../../../../core/services/EnderecoService';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDividerModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './perfil-page.html',
  styleUrl: './perfil-page.css'
})
export class PerfilPage implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly perfilService = inject(PerfilService);

  carregando = false;
  erroCarregamento = '';

  perfilForm = this.fb.group({
    login: [{ value: '', disabled: true }],
    nomeCompleto: ['', Validators.required],
    email: [{ value: '', disabled: true }],
    cpf: ['', Validators.required],
    telefone: ['', Validators.required]
  });

  private readonly enderecoApi = inject(EnderecoApiService);
  private readonly cepService = inject(EnderecoService);
  private readonly dialog = inject(MatDialog);
  private readonly changeDetector = inject(ChangeDetectorRef);

  enderecos: Endereco[] = [];

  carregandoEnderecos = false;
  salvandoEndereco = false;
  buscandoCep = false;

  mensagemEndereco = '';
  erroEndereco = '';

  editandoEnderecoId: number | null = null;

  enderecoForm = this.fb.group({
    rua: ['', Validators.required],
    bairro: ['', Validators.required],
    cidade: ['', Validators.required],
    estado: ['', Validators.required],
    cep: ['', [
      Validators.required,
      Validators.pattern(/^\d{5}-?\d{3}$/)
    ]],
    principal: [false]
  });

  ngOnInit(): void {
    this.carregarPerfil();
    this.carregarEnderecos();
  }

  carregarPerfil(): void {
    this.carregando = true;
    this.erroCarregamento = '';

    this.perfilService.obterPerfil().subscribe({
      next: (perfil) => {
        this.perfilForm.patchValue({
          login: perfil.login,
          nomeCompleto: perfil.nomeCompleto,
          email: perfil.email,
          cpf: perfil.cpf,
          telefone: perfil.telefone
        });

        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar perfil:', erro);

        this.erroCarregamento =
          'Não foi possível carregar seus dados.';

        this.carregando = false;
      }
    });
  }

  salvando = false;
  mensagemSucesso = '';
  erroSalvamento = '';

salvarPerfil(): void {
  if (this.perfilForm.invalid || this.salvando) {
    this.perfilForm.markAllAsTouched();
    return;
  }

  const dados = {
    nomeCompleto:
      this.perfilForm.controls.nomeCompleto.value ?? '',

    cpf:
      this.perfilForm.controls.cpf.value ?? '',

    telefone:
      this.perfilForm.controls.telefone.value ?? ''
  };

  this.salvando = true;
  this.mensagemSucesso = '';
  this.erroSalvamento = '';

  this.perfilService.atualizarPerfil(dados).subscribe({
    next: (perfilAtualizado) => {
      this.perfilForm.patchValue({
        login: perfilAtualizado.login,
        nomeCompleto: perfilAtualizado.nomeCompleto,
        email: perfilAtualizado.email,
        cpf: perfilAtualizado.cpf,
        telefone: perfilAtualizado.telefone
      });

      this.mensagemSucesso = 'Dados atualizados com sucesso!';
      this.salvando = false;
    },

    error: (erro) => {
      console.error('Erro ao atualizar perfil:', erro);

      this.erroSalvamento =
        erro.error?.message ??
        'Não foi possível salvar as alterações.';

      this.salvando = false;
    }
  });
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
    const cep = this.enderecoForm.controls.cep.value ?? '';

    this.buscandoCep = true;
    this.erroEndereco = '';

    this.cepService.buscarCep(cep).subscribe({
      next: (resposta) => {
        this.buscandoCep = false;

        if (resposta.erro) {
          this.erroEndereco = 'CEP não encontrado.';
          return;
        }

        this.enderecoForm.patchValue({
          rua: resposta.logradouro ?? '',
          bairro: resposta.bairro ?? '',
          cidade: resposta.localidade ?? '',
          estado: resposta.uf ?? ''
        });
      },
      error: (erro) => {
        console.error('Erro ao consultar CEP:', erro);
        this.buscandoCep = false;
        this.erroEndereco = 'Não foi possível consultar o CEP.';
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

    this.enderecoApi.editar(endereco.id, dados).subscribe({
      next: () => {
        this.mensagemEndereco = 'Endereço principal atualizado.';
        this.changeDetector.markForCheck();
        this.carregarEnderecos();
      },
      error: (erro) => {
        console.error('Erro ao definir endereço principal:', erro);
        this.erroEndereco = 'Não foi possível definir o endereço principal.';
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
      if (!confirmado) {
        return;
      }

      this.enderecoApi.remover(endereco.id).subscribe({
        next: () => {
          this.mensagemEndereco = 'Endereço removido com sucesso.';
          this.changeDetector.markForCheck();
          this.carregarEnderecos();
        },
        error: (erro) => {
          console.error('Erro ao excluir endereço:', erro);
          this.erroEndereco = 'Não foi possível excluir o endereço.';
          this.changeDetector.markForCheck();
        }
      });
    });
  }

  cancelarEdicaoEndereco(): void {
    this.editandoEnderecoId = null;
    this.enderecoForm.reset({
      rua: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      principal: false
    });
  }

  mostrarSenhaAtual = false;
  mostrarNovaSenha = false;
  mostrarConfirmacao = false;

  alterandoSenha = false;
  mensagemSenha = '';
  erroSenha = '';

  senhaForm = this.fb.group(
  {
    senhaAtual: ['', Validators.required],
    novaSenha: [
      '',
      [Validators.required, Validators.minLength(8)]
    ],
    confirmarSenha: ['', Validators.required]
  },
  {
    validators: (form) => {
      const novaSenha = form.get('novaSenha')?.value;
      const confirmarSenha = form.get('confirmarSenha')?.value;

      if (!confirmarSenha) {
        return null;
      }

      return novaSenha === confirmarSenha
        ? null
        : { senhasDiferentes: true };
    }
  }
  );

  alterarSenha(): void {
  this.mensagemSenha = '';
  this.erroSenha = '';

  if (this.senhaForm.invalid || this.alterandoSenha) {
    this.senhaForm.markAllAsTouched();
    return;
  }

  const { senhaAtual, novaSenha } = this.senhaForm.getRawValue();

  if (!senhaAtual || !novaSenha) {
    return;
  }

  this.alterandoSenha = true;

  this.perfilService.alterarSenha({
    senhaAtual,
    novaSenha
  }).subscribe({
    next: () => {
      this.mensagemSenha = 'Senha alterada com sucesso!';
      this.senhaForm.reset();
      this.alterandoSenha = false;
      this.mostrarSenhaAtual = false;
      this.mostrarNovaSenha = false;
      this.mostrarConfirmacao = false;
    },
    error: (erro) => {
      this.erroSenha =
        erro.error?.message ||
        'Não foi possível alterar a senha. Verifique sua senha atual e tente novamente.';

      this.alterandoSenha = false;
    }
  });
  }
}
