import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from "@angular/router";
import { CameraService } from "../../../../core/services/CameraService";
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { AdminPageHeader } from '../admin-page-header/admin-page-header';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { Camera } from '../../../../core/models/camera/Camera';
import { Marca } from '../../../../core/models/marca/Marca';
import { Modelo } from '../../../../core/models/modelo/Modelo';
import { MarcaService } from '../../../../core/services/MarcaService';
import { ModeloService } from '../../../../core/services/ModeloService';

@Component({
  imports: [
    ReactiveFormsModule,
    AdminPageHeader,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  selector: 'app-camera-form',
  styleUrl: './camera-form.css',
  templateUrl: './camera-form.html',
})
export class CameraForm implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  readonly form: FormGroup;
  marcas: Marca[] = [];
  modelos: Modelo[] = [];
  salvando = false;
  private modelosSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private cameraService: CameraService,
    private marcaService: MarcaService,
    private modeloService: ModeloService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.form = this.fb.group({
      id: [null],
      marcaId: [null, [Validators.required]],
      modeloId: [{ value: null, disabled: true }, [Validators.required]],
      resolucao: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(40)]],
      zoom: [0, [Validators.required, Validators.min(0)]],
      estabilizacao: [false],
      fps: ['', [Validators.required, Validators.pattern(/^[1-9]\d{0,2}$/)]]
    });
  }

  ngOnInit(): void {
    const marcaIdControl = this.form.controls['marcaId'];
    const modeloIdControl = this.form.controls['modeloId'];

    marcaIdControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((marcaId: number | null) => {
        modeloIdControl.setValue(null, { emitEvent: false });
        if (marcaId) {
          modeloIdControl.enable({ emitEvent: false });
          this.carregarModelosPorMarca(marcaId);
        } else {
          this.modelosSub?.unsubscribe();
          this.modelos = [];
          modeloIdControl.disable({ emitEvent: false });
          this.cdr.markForCheck();
        }
      });

    this.carregarMarcas();

    const camera = this.activatedRoute.snapshot.data['camera'] as Camera | undefined;
    if (camera) {
      const marcaIdInicial = camera.marcaId ?? camera.marca?.id ?? null;
      const modeloIdInicial = camera.modeloId ?? camera.modelo?.id ?? null;

      this.form.patchValue(
        {
          ...camera,
          marcaId: marcaIdInicial,
        },
        { emitEvent: false }
      );

      if (marcaIdInicial) {
        modeloIdControl.enable({ emitEvent: false });
        this.carregarModelosPorMarca(marcaIdInicial, modeloIdInicial);
      }
    }
  }

  carregarMarcas(): void {
    this.marcaService
      .findAll(0, 100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.marcas = response.items;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Erro ao carregar marcas:', error);
          this.exibirMensagem('Erro ao carregar as marcas.');
          this.cdr.markForCheck();
        },
      });
  }

  carregarModelosPorMarca(marcaId: number, modeloSelecionadoId?: number | null): void {
    this.modelosSub?.unsubscribe();
    this.modelosSub = this.modeloService
      .findByMarca(marcaId, 0, 100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.modelos = response.items;
          if (modeloSelecionadoId) {
            const pertence = this.modelos.some((m) => m.id === modeloSelecionadoId);
            if (pertence) {
              this.form.controls['modeloId'].setValue(modeloSelecionadoId, { emitEvent: false });
            }
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Erro ao carregar modelos da marca:', error);
          this.modelos = [];
          this.exibirMensagem('Erro ao carregar os modelos da marca selecionada.');
          this.cdr.markForCheck();
        },
      });
  }

  salvar(): void {
    if (this.salvando) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.cdr.markForCheck();
      this.exibirMensagem('Revise os campos destacados antes de salvar.');
      return;
    }

    const camera = this.form.getRawValue() as Camera;
    const modeloEscolhido = this.modelos.find((m) => m.id === camera.modeloId);
    const marcaDoModelo = modeloEscolhido?.marcaId ?? modeloEscolhido?.marca?.id;
    if (!modeloEscolhido || marcaDoModelo !== camera.marcaId) {
      this.form.controls['modeloId'].setErrors({ marcaIncompativel: true });
      this.form.controls['modeloId'].markAsTouched();
      this.cdr.markForCheck();
      this.exibirMensagem('O modelo selecionado deve pertencer à marca escolhida.');
      return;
    }

    this.salvando = true;
    this.cdr.markForCheck();

    const resultado = camera.id
      ? this.cameraService.update(camera.id, camera)
      : this.cameraService.create(camera);

    resultado.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.salvando = false;
        this.cdr.markForCheck();
        this.exibirMensagem('Câmera salva com sucesso!');
        this.router.navigate(['/admin/cameras']);
      },
      error: (error) => {
        this.salvando = false;
        this.cdr.markForCheck();
        console.error('Erro ao salvar câmera:', error);
        this.exibirMensagem('Não foi possível salvar a câmera.');
      },
    });
  }

  excluir(): void {
    const camera = this.form.getRawValue() as Camera;
    if (!camera.id) {
      return;
    }

    const nomeModelo = this.modelos.find((m) => m.id === camera.modeloId)?.nome || `ID ${camera.id}`;
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Câmera',
        mensagem: `Deseja realmente excluir a câmera "${nomeModelo}"?`
      }
    });

    confirmRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmado) => {
        if (!confirmado) {
          return;
        }

        this.cameraService
          .delete(camera.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.exibirMensagem('Câmera excluída com sucesso!');
              this.router.navigate(['/admin/cameras']);
            },
            error: (error) => {
              console.error('Erro ao excluir câmera:', error);
              this.exibirMensagem('Não foi possível excluir a câmera.');
            },
          });
      });
  }

  exibirMensagem(mensagem: string): void {
    this.snack.open(mensagem, 'Ok', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  voltar(): void {
    this.router.navigate(['/admin/cameras']);
  }
}
