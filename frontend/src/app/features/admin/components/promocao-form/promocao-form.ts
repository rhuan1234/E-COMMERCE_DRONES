import { Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { Drone } from '../../../../core/models/drone/Drone';
import { DroneService } from '../../../../core/services/DroneService';
import { PromocaoRequest } from '../../../../core/models/promocao/PromocaoRequest';
import { PromocaoService } from '../../../../core/services/PromocaoService';
import { MatDivider } from '@angular/material/divider';

function validarIntervaloPromocao(control: AbstractControl): ValidationErrors | null {
  const inicio = control.get('dataInicio')?.value;
  const fim = control.get('dataFim')?.value;

  if (!inicio || !fim) {
    return null;
  }

  return new Date(fim) > new Date(inicio) ? null : { intervaloInvalido: true };
}

@Component({
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatToolbarModule, MatSelectModule, MatIconModule, MatSnackBarModule,
    MatCheckboxModule, MatDialogModule, MatDivider],
  selector: 'app-promocao-form',
  styleUrl: './promocao-form.css',
  templateUrl: './promocao-form.html',
})
export class PromocaoForm implements OnInit {
  readonly form: FormGroup;
  private readonly location = inject(Location);
  private readonly droneService = inject(DroneService);
  drones: Drone[] = [];
  dronesFiltrados: Drone[] = [];
  dronesSelecionados: Drone[] = [];

  constructor(
    private fb: FormBuilder,
    private promocaoService: PromocaoService,
    private route: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router
  ) {
    this.form = this.fb.group({
      id: [null],

      nome: [
        '',
        [Validators.required, Validators.pattern(/\S/), Validators.minLength(2), Validators.maxLength(100)]
      ],

      percentualDesconto: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)]
      ],

      dataInicio: ['', Validators.required],
      dataFim: ['', Validators.required]
    }, { validators: validarIntervaloPromocao });
  }

  ngOnInit(): void {
    this.carregarPromocao();
  }

  carregarPromocao(): void {

    const id = this.route.snapshot.paramMap.get('id');

    // Se não existe ID, estamos criando uma nova promoção
    if (!id) {
      return;
    }

    this.promocaoService
      .findById(Number(id))
      .subscribe({
        next: (promocao) => {

          // Preenche os campos da promoção
          this.form.patchValue({
            id: promocao.id,
            nome: promocao.nome,
            percentualDesconto: promocao.percentualDesconto,

            // Converte a data do backend para o formato
            // aceito pelo input datetime-local
            dataInicio: this.formatarDataParaInput(
              promocao.dataInicio
            ),

            dataFim: this.formatarDataParaInput(
              promocao.dataFim
            )
          });

          // Busca os drones que pertencem à promoção
          this.carregarDronesSelecionados(
            promocao.droneIds
          );
        },

        error: (error) => {
          console.error(
            'Erro ao carregar promoção:',
            error
          );

          this.exibirMensagem(
            'Erro ao carregar promoção.'
          );
        }
      });
  }

  pesquisarDrone(modelo: string): void {

    const termo = modelo.trim();

    if (!termo) {
      this.dronesFiltrados = [];
      return;
    }

    this.droneService
      .findByModelo(0, 10, termo)
      .subscribe({
        next: (response) => {
          this.dronesFiltrados = response.items;
        },

        error: (error) => {
          console.error(
            'Erro ao pesquisar drones:',
            error
          );
        }
      });
  }

  adicionarDrone(drone: Drone): void {

    const jaSelecionado =
      this.dronesSelecionados.some(
        d => d.id === drone.id
      );

    if (!jaSelecionado) {
      this.dronesSelecionados.push(drone);
    }
  }

  removerDrone(drone: Drone): void {

    this.dronesSelecionados =
      this.dronesSelecionados.filter(
        d => d.id !== drone.id
      );
  }

  carregarDronesSelecionados(ids: number[]): void {

    this.dronesSelecionados = [];

    ids.forEach(id => {

      this.droneService
        .findById(id)
        .subscribe({
          next: (drone) => {

            this.dronesSelecionados.push(
              drone
            );
          },

          error: (error) => {

            console.error(
              `Erro ao carregar drone ${id}:`,
              error
            );
          }
        });
    });
  }

  salvar(): void {
    if (this.form.invalid) {

      this.form.markAllAsTouched();

      this.exibirMensagem(
        'Preencha todos os campos obrigatórios.'
      );
      return;
    }

    const valores = this.form.getRawValue();
    const dataInicio = this.form.get('dataInicio')?.value as string | null;
    const dataFim = this.form.get('dataFim')?.value as string | null;
    const promocao: PromocaoRequest = {

      ...valores,

      dataInicio: this.formatarData(
        dataInicio
      ),

      dataFim: this.formatarData(
        dataFim
      ),

      // Envia somente os IDs dos drones
      droneIds:
        this.dronesSelecionados.map(
          drone => drone.id!
        )
    };

    const id = this.form.value.id;
    const requisicao = id ? this.promocaoService.update(id, promocao)
      : this.promocaoService.create(promocao);

    requisicao.subscribe({

      next: () => {

        this.snack.open(
          id
            ? 'Promoção atualizada com sucesso!'
            : 'Promoção criada com sucesso!',
          'Fechar',
          {
            duration: 3000
          }
        );

        this.router.navigate([
          '/promocoes'
        ]);
      },

      error: (error) => {

        console.error(
          'Erro ao salvar promoção:',
          error
        );

        this.exibirMensagem(
          'Erro ao salvar promoção.'
        );
      }
    });
  }

  excluir(): void {

    const id = this.form.value.id;

    // Não existe promoção para excluir
    if (!id) {
      return;
    }

    this.promocaoService
      .delete(id)
      .subscribe({

        next: () => {

          this.snack.open(
            'Promoção excluída com sucesso!',
            'Fechar',
            {
              duration: 3000
            }
          );

          this.router.navigate([
            '/promocoes'
          ]);
        },

        error: (error) => {

          console.error(
            'Erro ao excluir promoção:',
            error
          );

          this.exibirMensagem(
            'Erro ao excluir promoção.'
          );
        }
      });
  }

  exibirMensagem(mensagem: string): void {

    this.snack.open(
      mensagem,
      'Ok',
      {
        duration: 2500,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      }
    );
  }
  formatarDataParaInput(
    data: string | null | undefined
  ): string {

    if (!data) {
      return '';
    }

    return data.substring(0, 16);
  }

  formatarData(
    data: string | null | undefined
  ): string {

    if (!data) {
      return '';
    }

    const valor = data.trim();

    if (!valor) {
      return '';
    }

    return valor.length === 16 ? `${valor}:00` : valor;
  }

  voltar(): void {
    this.location.back();
  }
}