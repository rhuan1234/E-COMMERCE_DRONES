import { Location } from '@angular/common';
import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CameraService } from "../../../../core/services/CameraService";
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatSelectModule} from '@angular/material/select';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({ 
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, 
            MatInputModule, MatButtonModule, MatToolbarModule, 
            MatSelectModule, MatIconModule, MatSnackBarModule],
  selector: 'app-camera-form',
  styleUrl: './camera-form.css',
  templateUrl: './camera-form.html',
})
export class CameraForm implements OnInit{
  
  readonly form: FormGroup;
  private readonly location = inject(Location);

  constructor(
    private fb: FormBuilder,
    private cameraService: CameraService,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router 
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
    const camera = this.activatedRoute.snapshot.data['camera'];

    if (camera) {
      this.form.patchValue(camera);
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
        this.router.navigate(['/cameras']);
      }
  });
  }

  excluir () {
    const camera = this.form.value;

    if (camera.id) {
      this.cameraService.delete(camera.id).subscribe({
        next: () => {
          this.exibirMensagem('Câmera excluída com sucesso!');
          this.router.navigate(['/cameras']);
        },
        error: (error) => {
          this.exibirMensagem('Erro ao excluir a câmera: ');
          console.log('Erro ao excluir a câmera: ', error);
        }
      });
    }
  }

  exibirMensagem(mensagem: string): void {
    this.snack.open(mensagem, 'Ok', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  voltar () {
    this.location.back();
  }
}
