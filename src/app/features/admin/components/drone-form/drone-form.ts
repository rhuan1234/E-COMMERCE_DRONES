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
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DroneService } from '../../../../core/services/DroneService';
import { CameraService } from '../../../../core/services/CameraService';
import { FornecedorService } from '../../../../core/services/FornecedorService';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';


import { Camera } from '../../../../core/models/camera/Camera';
import { Fornecedor } from '../../../../core/models/fornecedor/FornecedorRequest';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';


@Component({

  imports: [
    CommonModule,
    ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatToolbarModule, MatSelectModule, MatIconModule, MatSnackBarModule,
    MatCheckboxModule, MatDialogModule, MatDividerModule, MatStepperModule
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
      nome: ['', [Validators.required, Validators.pattern(/\S/), Validators.minLength(2), Validators.maxLength(100)]],
      marca: ['', [Validators.required, Validators.pattern(/\S/), Validators.minLength(2), Validators.maxLength(60)]],
      modelo: ['', [Validators.required, Validators.pattern(/\S/), Validators.minLength(2), Validators.maxLength(60)]],
      preco: [0, [Validators.required, Validators.min(0)]],
      quantidadeDisponivel: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
      ativa: [true],
      tempoVooPratico: [0, [Validators.required, Validators.min(1)]],
      pesoDecolagem: [0, [Validators.required, Validators.min(1)]],
      altitudeMaxima: [0, [Validators.required, Validators.min(1)]],
      velocidadeMaxima: [0, [Validators.required, Validators.min(1)]],
      alcanceTransmissao: [0, [Validators.required, Validators.min(1)]],
      possuiCamera: [false],
      quantidadeMotores: [0, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
      comControleRemoto: [false],
      controladoPorAplicativo: [false],
      quantidadeBaterias: [0, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
      duracaoBateria: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(40)]],
      frequenciaWifi: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(40)]],
      possuiGPS: [false],
      cameraId: [null],
      fornecedorId: [null, Validators.required]

    });

  }


  ngOnInit(): void {
    const possuiCameraControl = this.form.controls['possuiCamera'];
    const cameraIdControl = this.form.controls['cameraId'];
    const atualizarValidacaoCamera = (possuiCamera: boolean | null) => {
      cameraIdControl.setValidators(possuiCamera ? Validators.required : null);
      cameraIdControl.updateValueAndValidity({ emitEvent: false });
    };

    possuiCameraControl.valueChanges.subscribe(atualizarValidacaoCamera);
    atualizarValidacaoCamera(possuiCameraControl.value);

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
    this.cameraService.findAll(0, 100).subscribe({
      next: (response) => {
        this.cameras = response.items;
      },
      error: (error) => {
        console.error('Erro ao carregar câmeras:', error);
        this.exibirMensagem('Erro ao carregar as câmeras.');
      }
    });
  }

  carregarFornecedores(): void {
    this.fornecedorService.findAll(0, 100).subscribe({
      next: (response) => {
        this.fornecedores = response.items;
      },

      error: (error) => {
        console.error('Erro ao carregar fornecedores:', error);
        this.exibirMensagem('Erro ao carregar os fornecedores.');
      }
    });
  }

   salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.exibirMensagem('Revise os campos destacados antes de salvar.');
      return;
    }

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