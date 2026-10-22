import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CameraService } from "../../../../core/services/CameraService";
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
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
    MatCardModule,
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
  readonly form: FormGroup;
  marcas: Marca[] = [];
  modelos: Modelo[] = [];

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

    marcaIdControl.valueChanges.subscribe((marcaId: number | null) => {
      modeloIdControl.setValue(null, { emitEvent: false });
      if (marcaId) {
        modeloIdControl.enable({ emitEvent: false });
        this.carregarModelosPorMarca(marcaId);
      } else {
        this.modelos = [];
        modeloIdControl.disable({ emitEvent: false });
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
    this.marcaService.findAll(0, 100).subscribe({
      next: (response) => {
        this.marcas = response.items;
      },
      error: (error) => {
        console.error('Erro ao carregar marcas:', error);
        this.exibirMensagem('Erro ao carregar as marcas.');
      },
    });
  }

  carregarModelosPorMarca(marcaId: number, modeloSelecionadoId?: number | null): void {
    this.modeloService.findByMarca(marcaId, 0, 100).subscribe({
      next: (response) => {
        this.modelos = response.items;
        if (modeloSelecionadoId) {
          const pertence = this.modelos.some((m) => m.id === modeloSelecionadoId);
          if (pertence) {
            this.form.controls['modeloId'].setValue(modeloSelecionadoId, { emitEvent: false });
          }
        }
      },
      error: (error) => {
        console.error('Erro ao carregar modelos da marca:', error);
        this.modelos = [];
        this.exibirMensagem('Erro ao carregar os modelos da marca selecionada.');
      },
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.exibirMensagem('Revise os campos destacados antes de salvar.');
      return;
    }

    const camera = this.form.getRawValue() as Camera;
    const modeloEscolhido = this.modelos.find((m) => m.id === camera.modeloId);
    const marcaDoModelo = modeloEscolhido?.marcaId ?? modeloEscolhido?.marca?.id;
    if (!modeloEscolhido || marcaDoModelo !== camera.marcaId) {
      this.form.controls['modeloId'].setErrors({ marcaIncompativel: true });
      this.form.controls['modeloId'].markAsTouched();
      this.exibirMensagem('O modelo selecionado deve pertencer à marca escolhida.');
      return;
    }

    const resultado = camera.id
      ? this.cameraService.update(camera.id, camera)
      : this.cameraService.create(camera);

    resultado.subscribe({
      next: () => {
        this.exibirMensagem('Câmera salva com sucesso!');
        this.router.navigate(['/cameras']);
      },
      error: (error) => {
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

    confirmRef.afterClosed().subscribe((confirmado) => {
      if (!confirmado) {
        return;
      }

      this.cameraService.delete(camera.id).subscribe({
        next: () => {
          this.exibirMensagem('Câmera excluída com sucesso!');
          this.router.navigate(['/cameras']);
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
    this.router.navigate(['/cameras']);
  }
}
