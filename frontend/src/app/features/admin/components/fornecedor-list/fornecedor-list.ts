import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { Fornecedor } from '../../../../core/models/fornecedor/FornecedorRequest';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FornecedorService } from '../../../../core/services/FornecedorService';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AdminPageHeader } from '../admin-page-header/admin-page-header';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FornecedorDetalhesDialog } from '../fornecedor-detalhes-dialog/fornecedor-detalhes-dialog';

@Component({
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatProgressBarModule,
    AdminPageHeader,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    MatDialogModule,
  ],
  selector: 'app-fornecedor-list',
  styleUrl: './fornecedor-list.css',
  templateUrl: './fornecedor-list.html',
})
export class FornecedorList implements OnInit {
  /** O app roda sem Zone.js: avisa o Angular quando uma resposta assíncrona muda o estado. */
  private readonly cdr = inject(ChangeDetectorRef);

  displayedColumns: string[] = ['id', 'nome', 'cnpj', 'telefone', 'email', 'acao'];
  dataSource = new MatTableDataSource<Fornecedor>();
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;
  carregando = false;
  erroCarregamento = false;
  filtroNome = '';

  constructor(
    private fornecedorService: FornecedorService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const nome = params['nome'];
      if (nome && nome.trim()) {
        this.filtroNome = nome.trim();
        this.carregarFornecedorPorNome(this.filtroNome);
      } else {
        this.filtroNome = '';
        this.carregarFornecedores();
      }
    });
  }

  carregarFornecedores(): void {
    this.carregando = true;
    this.erroCarregamento = false;
    this.fornecedorService.findAll(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        this.carregando = false;
        this.cdr.markForCheck();
        this.dataSource.data = response.items;
        this.pageIndex = response.page;
        this.pageSize = response.pageSize;
        this.totalItems = response.totalItems;
      },
      error: (err) => {
        this.carregando = false;
        this.cdr.markForCheck();
        this.erroCarregamento = true;
        console.error('Erro ao carregar fornecedores', err);
      },
    });
  }

  carregarFornecedorPorNome(nome: string): void {
    this.carregando = true;
    this.erroCarregamento = false;
    this.fornecedorService.findByNome(this.pageIndex, this.pageSize, nome).subscribe({
      next: (response) => {
        this.carregando = false;
        this.cdr.markForCheck();
        this.dataSource.data = response.items;
        this.pageIndex = response.page;
        this.pageSize = response.pageSize;
        this.totalItems = response.totalItems;
      },
      error: (err) => {
        this.carregando = false;
        this.cdr.markForCheck();
        this.erroCarregamento = true;
        console.error('Erro ao carregar fornecedores por nome', err);
      },
    });
  }

  filtrarPorNome(nome: string): void {
    const termo = (nome || '').trim();
    this.pageIndex = 0;
    if (termo) {
      this.router.navigate(['/admin/fornecedores/filtro/nome', termo]);
    } else {
      this.router.navigate(['/admin/fornecedores']);
    }
  }

  limparFiltro(input?: HTMLInputElement): void {
    if (input) {
      input.value = '';
    }
    this.filtroNome = '';
    this.pageIndex = 0;
    this.router.navigate(['/admin/fornecedores']);
  }

  abrirDetalhes(fornecedor: Fornecedor): void {
    this.dialog.open(FornecedorDetalhesDialog, {
      width: '720px',
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: '90vh',
      data: fornecedor,
    });
  }

  excluirFornecedor(fornecedor: Fornecedor): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Fornecedor',
        mensagem: `Deseja realmente excluir o fornecedor "${fornecedor.nome}"?`
      }
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (!confirmado) {
        return;
      }

      this.fornecedorService.delete(fornecedor.id).subscribe({
        next: () => this.carregarListaAtual(),
        error: (err) => console.error('Erro ao excluir fornecedor', err)
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
      this.carregarFornecedorPorNome(this.filtroNome);
    } else {
      this.carregarFornecedores();
    }
  }
}