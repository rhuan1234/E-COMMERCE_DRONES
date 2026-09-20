import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
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
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DroneService } from '../../../../core/services/DroneService';
import { CameraService } from '../../../../core/services/CameraService';
import { FornecedorService } from '../../../../core/services/FornecedorService';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';


import { Camera } from '../../../../core/models/Camera';
import { Fornecedor } from '../../../../core/models/fornecedor/FornecedorRequest';


@Component({

  imports: [
    CommonModule,
    ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatToolbarModule, MatSelectModule, MatIconModule, MatSnackBarModule,
    MatCheckboxModule, MatDialogModule
  ],
  selector: 'app-drone-form',
  styleUrl: './drone-form.css',
  templateUrl: './drone-form.html',

})
export class DroneForm implements OnInit {
  readonly form: FormGroup;
  cameras: Camera[] = [];
  fornecedores: Fornecedor[] = [];
  private readonly location = inject(Location);

  constructor(

    private fb: FormBuilder,
    private droneService: DroneService,
    private cameraService: CameraService,
    private fornecedorService: FornecedorService,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router,
    private dialog: MatDialog

  ) {

    this.form = this.fb.group({

      id: [null],
      nome: [''],
      marca: [''],
      modelo: [''],
      preco: [0],
      quantidadeDisponivel: [0],
      ativa: [true],
      tempoVooPratico: [0],
      pesoDecolagem: [0],
      altitudeMaxima: [0],
      velocidadeMaxima: [0],
      alcanceTransmissao: [0],
      possuiCamera: [false],
      quantidadeMotores: [0],
      comControleRemoto: [false],
      controladoPorAplicativo: [false],
      quantidadeBaterias: [0],
      duracaoBateria: [''],
      frequenciaWifi: [''],
      possuiGPS: [false],
      cameraId: [null],
      fornecedorId: [null]

    });

  }


  ngOnInit(): void {
    this.carregarCameras();
    this.carregarFornecedores();

    const drone = this.activatedRoute.snapshot.data['drone'];

    if (drone) {

      this.form.patchValue({
        ...drone,
        cameraId: drone.camera?.id
      });

    }
  }


  carregarCameras(): void {
    this.cameraService.findAll().subscribe({
      next: (cameras) => {

        this.cameras = cameras;

      },
      error: (error) => {
        console.error('Erro ao carregar câmeras:', error);
        this.exibirMensagem('Erro ao carregar as câmeras.');
      }
    });
  }

  carregarFornecedores(): void {
    this.fornecedorService.findAll().subscribe({
      next: (fornecedores) => {
        this.fornecedores = fornecedores;
      },

      error: (error) => {
        console.error('Erro ao carregar fornecedores:', error);
        this.exibirMensagem('Erro ao carregar os fornecedores.');
      }
    });

  }

   salvar(): void {
    const drone = this.form.value;
    const resultado = drone.id
      ? this.droneService.update(drone.id, drone)
      : this.droneService.create(drone);

    resultado.subscribe({
      next: () => {
        this.exibirMensagem('Drone salvo com sucesso!');
        this.router.navigate(['/drones']);
      },
      error: (error) => {
        console.error('Erro ao salvar drone:', error);
        this.exibirMensagem('Erro ao salvar o drone.');
      }
    });
  }


  excluir(): void {
    const drone = this.form.value;
    if (!drone.id) {
      return;

    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Drone',
        mensagem: `Deseja realmente excluir o drone "${drone.nome}"?`
      }
    });
    dialogRef.afterClosed().subscribe((confirmado) => {
      if (!confirmado) {
        return;
      }

      this.droneService.delete(drone.id).subscribe({
        next: () => {
          this.exibirMensagem('Drone excluído com sucesso!');
          this.router.navigate(['/drones']);
        },
        error: (error) => {
          this.exibirMensagem('Erro ao excluir o drone.');
          console.log('Erro ao excluir o drone:', error);
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

  voltar(): void {

    this.location.back();

  }

}