import { Location } from '@angular/common';
import { Component, Inject, inject, OnInit, Optional } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CameraService } from "../../../../core/services/CameraService";
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { Camera } from '../../../../core/models/camera/Camera';

@Component({
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatToolbarModule,
    MatSelectModule, MatIconModule, MatSnackBarModule, MatDialogModule],
  selector: 'app-camera-form',
  styleUrl: './camera-form.css',
  templateUrl: './camera-form.html',
})
export class CameraForm implements OnInit {

  readonly form: FormGroup;
  private readonly location = inject(Location);

  constructor(
    private fb: FormBuilder,
    private cameraService: CameraService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    @Optional() public dialogRef?: MatDialogRef<CameraForm>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: { camera?: Camera }
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
    if (this.data?.camera) {
      this.form.patchValue(this.data.camera);
    }
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.exibirMensagem('Revise os campos destacados antes de salvar.');
      return;
    }

    const camera = this.form.value;

    let resultado = (camera.id) ?
      this.cameraService.update(camera.id, camera) :
      this.cameraService.create(camera);

    resultado.subscribe({
      next: () => {
        this.exibirMensagem('Câmera salva com sucesso!');
        if (this.dialogRef) {
          this.dialogRef.close(true);
        } else {
          this.router.navigate(['/cameras']);
        }
      }
    });
  }

  excluir() {
    const camera = this.form.value;

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
          if (this.dialogRef) {
            this.dialogRef.close(true);
          } else {
            this.router.navigate(['/cameras']);
          }
        },
        error: (error) => {
          this.exibirMensagem('Erro ao excluir a câmera: ');
          console.log('Erro ao excluir a câmera: ', error);
        }
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

  voltar() {
    this.location.back();
  }
}
