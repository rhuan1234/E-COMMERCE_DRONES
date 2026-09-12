import { Location } from '@angular/common';
import { Component, Inject, inject, OnInit } from "@angular/core";
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
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Camera } from '../../../../core/models/Camera';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';

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
    public dialogRef: MatDialogRef<CameraForm>,
    @Inject(MAT_DIALOG_DATA) public data: { camera?: Camera }
  ) {
    this.form = this.fb.group({
      id: [null],
      modelo: [''],
      marca: [''],
      resolucao: [''],
      zoom: [0],
      estabilizacao: [false],
      fps: ['']
    })
  }

  ngOnInit(): void {

    if (this.data?.camera) {
      this.form.patchValue(this.data.camera);
    }
  }

  salvar() {
    const camera = this.form.value;

    let resultado = (camera.id) ?
      this.cameraService.update(camera.id, camera) :
      this.cameraService.create(camera);

    resultado.subscribe({
      next: () => {
        this.exibirMensagem('Câmera salva com sucesso!');
        this.dialogRef.close(true);
      }
    });
  }

  excluir() {
    const camera = this.form.value;

    if(!camera.id)
      return;

    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Câmera',
        mensagem: `Deseja realmente excluir a câmera "${camera.modelo}"?`
      }
    });

    confirmRef.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.cameraService.delete(camera.id).subscribe({
          next: () => {
            this.exibirMensagem('Câmera excluída com sucesso!');
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.exibirMensagem('Erro ao excluir a câmera: ');
            console.log('Erro ao excluir a câmera: ', error);
          }
        });
      }
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
