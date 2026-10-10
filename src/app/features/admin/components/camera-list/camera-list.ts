import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { CameraService } from '../../../../core/services/CameraService';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CameraForm } from '../camera-form/camera-form';
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

  constructor(
    private cameraService: CameraService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.carregarCameras();
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

  openFormDialog(camera?: Camera): void {
    const dialogRef = this.dialog.open(CameraForm, {
      width: '600px',
      data: { camera }
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.carregarCameras();
      }
    });
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
        next: () => this.carregarCameras(),
        error: (err) => console.error('Erro ao excluir', err)
      });
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.carregarCameras();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
