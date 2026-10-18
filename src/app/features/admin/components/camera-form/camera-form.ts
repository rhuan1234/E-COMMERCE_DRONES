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

  constructor(
    private fb: FormBuilder,
    private cameraService: CameraService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.form = this.fb.group({
      id: [null],
      modelo: ['', [Validators.required, Validators.pattern(/\S/), Validators.minLength(2), Validators.maxLength(60)]],
      marca: ['', [Validators.required, Validators.pattern(/\S/), Validators.minLength(2), Validators.maxLength(60)]],
      resolucao: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(40)]],
      zoom: [0, [Validators.required, Validators.min(0)]],
      estabilizacao: [false],
      fps: ['', [Validators.required, Validators.pattern(/^[1-9]\d{0,2}$/)]]
    })
  }

  ngOnInit(): void {
    const camera = this.activatedRoute.snapshot.data['camera'] as Camera | undefined;
    if (camera) {
      this.form.patchValue(camera);
    }
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.exibirMensagem('Revise os campos destacados antes de salvar.');
      return;
    }

    const camera = this.form.getRawValue() as Camera;
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

    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Câmera',
        mensagem: `Deseja realmente excluir a câmera "${camera.modelo}"?`
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
