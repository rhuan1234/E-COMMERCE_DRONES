import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router } from '@angular/router';
import { CameraService } from '../../../../core/services/CameraService';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Camera } from '../../../../core/models/camera/Camera';

@Component({
  imports: [
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  selector: 'app-camera-list',
  styleUrl: './camera-list.css',
  templateUrl: './camera-list.html',
})
export class CameraList implements OnInit {

  displayedColumns: string[] = ['id', 'modelo', 'marca', 'resolucao', 'zoom', 'estabilizacao', 'fps', 'acao'];
  dataSource = new MatTableDataSource<Camera>();
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;
  filtroModelo = '';

  constructor(
    private cameraService: CameraService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const modelo = params['modelo'];
      if (modelo && modelo.trim()) {
        this.filtroModelo = modelo.trim();
        this.carregarCameraPorModelo(this.filtroModelo);
      } else {
        this.filtroModelo = '';
        this.carregarCameras();
      }
    });
  }

  carregarCameras(): void {
    this.cameraService.findAll(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        this.dataSource.data = response.items;
        this.pageIndex = response.page;
        this.pageSize = response.pageSize;
        this.totalItems = response.totalItems;
      },
      error: (err) => console.error('Erro ao carregar câmeras', err),
    });
  }

  carregarCameraPorModelo(modelo: string): void {
    this.cameraService.findByModelo(this.pageIndex, this.pageSize, modelo).subscribe({
      next: (response) => {
        this.dataSource.data = response.items;
        this.pageIndex = response.page;
        this.pageSize = response.pageSize;
        this.totalItems = response.totalItems;
      },
      error: (err) => console.error('Erro ao carregar câmeras por modelo', err),
    });
  }

  filtrarPorModelo(modelo: string): void {
    const termo = (modelo || '').trim();
    this.pageIndex = 0;
    if (termo) {
      this.router.navigate(['/cameras/filtro/modelo', termo]);
    } else {
      this.router.navigate(['/cameras']);
    }
  }

  limparFiltro(input?: HTMLInputElement): void {
    if (input) {
      input.value = '';
    }
    this.filtroModelo = '';
    this.pageIndex = 0;
    this.router.navigate(['/cameras']);
  }

  novaCamera(): void {
    this.router.navigate(['/cameras/new']);
  }

  editarCamera(camera: Camera): void {
    this.router.navigate(['/cameras', camera.id, 'edit']);
  }

  excluirCamera(camera: Camera): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Câmera',
        mensagem: `Tem certeza que deseja excluir a câmera "${camera.modelo}"?`
      }
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (!confirmado) {
        return;
      }

      this.cameraService.delete(camera.id!).subscribe({
        next: () => this.carregarListaAtual(),
        error: (err) => console.error('Erro ao excluir', err)
      });
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.carregarListaAtual();
  }

  private carregarListaAtual(): void {
    if (this.filtroModelo) {
      this.carregarCameraPorModelo(this.filtroModelo);
    } else {
      this.carregarCameras();
    }
  }
}
