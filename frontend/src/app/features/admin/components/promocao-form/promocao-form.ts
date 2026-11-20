import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { AdminPageHeader } from '../admin-page-header/admin-page-header';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, catchError, debounceTime, distinctUntilChanged, forkJoin, of, switchMap } from 'rxjs';
import { Drone } from '../../../../core/models/drone/Drone';
import { DroneService } from '../../../../core/services/DroneService';
import { PromocaoRequest } from '../../../../core/models/promocao/PromocaoRequest';
import { PromocaoService } from '../../../../core/services/PromocaoService';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { DroneMarkComponent } from '../../../../shared/components/drone-mark/drone-mark';

function validarIntervaloPromocao(control: AbstractControl): ValidationErrors | null {
  const inicio = control.get('dataInicio')?.value;
  const fim = control.get('dataFim')?.value;

  if (!inicio || !fim) {
    return null;
  }

  return new Date(fim) > new Date(inicio) ? null : { intervaloInvalido: true };
}

@Component({
  imports: [ReactiveFormsModule, AdminPageHeader, DroneMarkComponent, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSelectModule, MatIconModule, MatSnackBarModule,
    MatCheckboxModule, MatDialogModule],
  selector: 'app-promocao-form',
  styleUrl: './promocao-form.css',
  templateUrl: './promocao-form.html',
})
export class PromocaoForm implements OnInit {
  readonly form: FormGroup;
  private readonly location = inject(Location);
  private readonly droneService = inject(DroneService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly termoPesquisa$ = new Subject<string>();
  drones: Drone[] = [];
  dronesFiltrados: Drone[] = [];
  dronesSelecionados: Drone[] = [];
  pesquisandoDrones = false;
  erroPesquisaDrones = false;
  salvando = false;

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
    this.termoPesquisa$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((termo) => {
          if (!termo) {
            this.pesquisandoDrones = false;
            this.erroPesquisaDrones = false;
            return of({ items: [] as Drone[] });
          }

          this.pesquisandoDrones = true;
          this.erroPesquisaDrones = false;
          this.cdr.markForCheck();

          return this.droneService.findByModelo(0, 10, termo).pipe(
            catchError((error) => {
              console.error('Erro ao pesquisar drones:', error);
              this.erroPesquisaDrones = true;
              return of({ items: [] as Drone[] });
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        this.pesquisandoDrones = false;
        this.dronesFiltrados = response.items;
        this.cdr.markForCheck();
      });

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
      .pipe(takeUntilDestroyed(this.destroyRef))
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
          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error(
            'Erro ao carregar promoção:',
            error
          );

          this.exibirMensagem(
            'Erro ao carregar promoção.'
          );
          this.cdr.markForCheck();
        }
      });
  }

  pesquisarDrone(modelo: string): void {

    const termo = (modelo ?? '').trim();

    if (!termo) {
      this.dronesFiltrados = [];
      this.pesquisandoDrones = false;
      this.erroPesquisaDrones = false;
      this.termoPesquisa$.next('');
      this.cdr.markForCheck();
      return;
    }

    this.termoPesquisa$.next(termo);
  }

  adicionarDrone(drone: Drone): void {

    const jaSelecionado =
      this.dronesSelecionados.some(
        d => d.id === drone.id
      );

    if (!jaSelecionado) {
      this.dronesSelecionados.push(drone);
      this.cdr.markForCheck();
    }
  }

  removerDrone(drone: Drone): void {

    this.dronesSelecionados =
      this.dronesSelecionados.filter(
        d => d.id !== drone.id
      );
    this.cdr.markForCheck();
  }

  carregarDronesSelecionados(ids: number[]): void {

    this.dronesSelecionados = [];

    if (!ids?.length) {
      this.cdr.markForCheck();
      return;
    }

    forkJoin(
      ids.map((id) =>
        this.droneService.findById(id).pipe(
          catchError((error) => {
            console.error(
              `Erro ao carregar drone ${id}:`,
              error
            );
            return of(null);
          })
        )
      )
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((drones) => {
        this.dronesSelecionados = drones.filter(
          (d): d is Drone => d !== null
        );
        this.cdr.markForCheck();
      });
  }

  salvar(): void {
    if (this.salvando) {
      return;
    }

    if (this.form.invalid) {

      this.form.markAllAsTouched();
      this.cdr.markForCheck();

      this.exibirMensagem(
        'Preencha todos os campos obrigatórios.'
      );
      return;
    }

    this.salvando = true;
    this.cdr.markForCheck();

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

    requisicao.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({

      next: () => {
        this.salvando = false;
        this.cdr.markForCheck();

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
          '/admin/promocoes'
        ]);
      },

      error: (error) => {
        this.salvando = false;
        this.cdr.markForCheck();

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

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Promoção',
        mensagem: `Deseja realmente excluir a promoção "${this.form.value.nome || id}"?`
      }
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmado) => {
        if (!confirmado) {
          return;
        }

        this.promocaoService
          .delete(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
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
              '/admin/promocoes'
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