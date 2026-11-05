import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { Marca } from '../../../../core/models/marca/Marca';
import { MarcaService } from '../../../../core/services/MarcaService';
import { MarcaDetalhesDialog } from '../marca-detalhes-dialog/marca-detalhes-dialog';

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
    MatSnackBarModule,
  ],
  selector: 'app-marca-list',
  styleUrl: './marca-list.css',
  templateUrl: './marca-list.html',
})
export class MarcaList implements OnInit {
  displayedColumns: string[] = ['id', 'nome', 'acao'];
  dataSource = new MatTableDataSource<Marca>();
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;
  filtroNome = '';

  constructor(
    private marcaService: MarcaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const nome = params['nome'];
      if (nome && nome.trim()) {
        this.filtroNome = nome.trim();
        this.carregarMarcaPorNome(this.filtroNome);
      } else {
        this.filtroNome = '';
        this.carregarMarcas();
      }
    });
  }

  carregarMarcas(): void {
    this.marcaService.findAll(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        this.dataSource.data = response.items;
        this.pageIndex = response.page;
        this.pageSize = response.pageSize;
        this.totalItems = response.totalItems;
      },
      error: (err) => console.error('Erro ao carregar marcas', err),
    });
  }

  carregarMarcaPorNome(nome: string): void {
    this.marcaService.findByNome(this.pageIndex, this.pageSize, nome).subscribe({
      next: (response) => {
        this.dataSource.data = response.items;
        this.pageIndex = response.page;
        this.pageSize = response.pageSize;
        this.totalItems = response.totalItems;
      },
      error: (err) => {
        this.dataSource.data = [];
        this.totalItems = 0;
        console.error('Erro ao carregar marcas por nome', err);
      },
    });
  }

  filtrarPorNome(nome: string): void {
    const termo = (nome || '').trim();
    this.pageIndex = 0;
    if (termo) {
      this.router.navigate(['/admin/marcas/filtro/nome', termo]);
    } else {
      this.router.navigate(['/admin/marcas']);
    }
  }

  limparFiltro(input?: HTMLInputElement): void {
    if (input) {
      input.value = '';
    }
    this.filtroNome = '';
    this.pageIndex = 0;
    this.router.navigate(['/admin/marcas']);
  }

  novaMarca(): void {
    this.router.navigate(['/admin/marcas/new']);
  }

  editarMarca(marca: Marca): void {
    this.router.navigate(['/admin/marcas', marca.id, 'edit']);
  }

  abrirDetalhes(marca: Marca): void {
    this.dialog.open(MarcaDetalhesDialog, {
      width: '560px',
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: '90vh',
      data: marca,
    });
  }

  excluirMarca(marca: Marca): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Marca',
        mensagem: `Tem certeza que deseja excluir a marca "${marca.nome}"?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (!confirmado) {
        return;
      }

      this.marcaService.delete(marca.id!).subscribe({
        next: () => {
          this.snackBar.open('Marca excluída com sucesso!', 'Ok', { duration: 2500 });
          this.carregarListaAtual();
        },
        error: (err) => {
          console.error('Erro ao excluir marca', err);
          const msg =
            err?.status === 409
              ? 'Não é possível excluir a marca pois há modelos, drones ou câmeras associados.'
              : 'Não foi possível excluir a marca.';
          this.snackBar.open(msg, 'Fechar', { duration: 3500 });
        },
      });
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.carregarListaAtual();
  }

  private carregarListaAtual(): void {
    if (this.filtroNome) {
      this.carregarMarcaPorNome(this.filtroNome);
    } else {
      this.carregarMarcas();
    }
  }
}
