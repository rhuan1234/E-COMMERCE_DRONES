import { Component, OnInit, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AdminPageHeader } from '../admin-page-header/admin-page-header';
import { ActivatedRoute, Router } from '@angular/router';
import { CameraService } from '../../../../core/services/CameraService';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Camera } from '../../../../core/models/camera/Camera';
import { CameraDetalhesDialog } from '../camera-detalhes-dialog/camera-detalhes-dialog';

@Component({
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatProgressBarModule,
    AdminPageHeader,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  selector: 'app-camera-list',
  styleUrl: './camera-list.css',
  templateUrl: './camera-list.html',
})
export class CameraList implements OnInit {
  /** O app roda sem Zone.js: avisa o Angular quando uma resposta assíncrona muda o estado. */
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);


  displayedColumns: string[] = ['id', 'modelo', 'marca', 'resolucao', 'zoom', 'estabilizacao', 'fps', 'acao'];
  dataSource = new MatTableDataSource<Camera>();
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;
  carregando = false;
  erroCarregamento = false;
  filtroModelo = '';

  constructor(
    private cameraService: CameraService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
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
    this.carregando = true;
    this.erroCarregamento = false;
    this.cdr.markForCheck();
    this.cameraService
      .findAll(this.pageIndex, this.pageSize)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        this.carregando = false;
        this.dataSource.data = response.items;
        this.pageIndex = response.page;
        this.pageSize = response.pageSize;
        this.totalItems = response.totalItems;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.carregando = false;
        this.erroCarregamento = true;
        console.error('Erro ao carregar câmeras', err);
        this.cdr.markForCheck();
      },
    });
  }

  carregarCameraPorModelo(modelo: string): void {
    this.carregando = true;
    this.erroCarregamento = false;
    this.cdr.markForCheck();
    this.cameraService
      .findByModelo(this.pageIndex, this.pageSize, modelo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        this.carregando = false;
        this.dataSource.data = response.items;
        this.pageIndex = response.page;
        this.pageSize = response.pageSize;
        this.totalItems = response.totalItems;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.carregando = false;
        this.erroCarregamento = true;
        console.error('Erro ao carregar câmeras por modelo', err);
        this.cdr.markForCheck();
      },
    });
  }

  filtrarPorModelo(modelo: string): void {
    const termo = (modelo || '').trim();
    this.pageIndex = 0;
    if (termo) {
      this.router.navigate(['/admin/cameras/filtro/modelo', termo]);
    } else {
      this.router.navigate(['/admin/cameras']);
    }
  }

  limparFiltro(input?: HTMLInputElement): void {
    if (input) {
      input.value = '';
    }
    this.filtroModelo = '';
    this.pageIndex = 0;
    this.router.navigate(['/admin/cameras']);
  }

  novaCamera(): void {
    this.router.navigate(['/admin/cameras/new']);
  }

  editarCamera(camera: Camera): void {
    this.router.navigate(['/admin/cameras', camera.id, 'edit']);
  }

  abrirDetalhes(camera: Camera): void {
    this.dialog.open(CameraDetalhesDialog, {
      width: '720px',
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: '90vh',
      data: camera,
    });
  }

  excluirCamera(camera: Camera): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Câmera',
        mensagem: `Tem certeza que deseja excluir a câmera "${camera.modelo?.nome || camera.id}"?`
      }
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmado) => {
        if (!confirmado) {
          return;
        }

        this.cameraService
          .delete(camera.id!)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
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
