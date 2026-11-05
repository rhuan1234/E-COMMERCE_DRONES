import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { PromocaoRequest } from '../../../../core/models/promocao/PromocaoRequest';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PromocaoService } from '../../../../core/services/PromocaoService';
import { PromocaoDetalhesDialog } from '../promocao-detalhes-dialog/promocao-detalhes-dialog';

@Component({
  imports: [
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    MatDialogModule,
  ],
  selector: 'app-promocao-list',
  styleUrl: './promocao-list.css',
  templateUrl: './promocao-list.html',
})
export class PromocaoList implements OnInit {
  displayedColumns: string[] = ['id', 'nome', 'desconto', 'inicio', 'fim', 'drones', 'acao'];
  dataSource = new MatTableDataSource<PromocaoRequest>();
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;
  filtroNome = '';

  constructor(
    private promocaoService: PromocaoService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const nome = params['nome'];
      if (nome && nome.trim()) {
        this.filtroNome = nome.trim();
        this.carregarPromocaoPorNome(this.filtroNome);
      } else {
        this.filtroNome = '';
        this.carregarPromocoes();
      }
    });
  }

  carregarPromocoes(): void {
    this.promocaoService.findAll(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        this.dataSource.data = response.items;
        this.pageIndex = response.page;
        this.pageSize = response.pageSize;
        this.totalItems = response.totalItems;
      },
      error: (err) => console.error('Erro ao carregar promoções', err),
    });
  }

  carregarPromocaoPorNome(nome: string): void {
    this.promocaoService.findByNome(this.pageIndex, this.pageSize, nome).subscribe({
      next: (response) => {
        this.dataSource.data = response.items;
        this.pageIndex = response.page;
        this.pageSize = response.pageSize;
        this.totalItems = response.totalItems;
      },
      error: (err) => console.error('Erro ao carregar promoções por nome', err),
    });
  }

  filtrarPorNome(nome: string): void {
    const termo = (nome || '').trim();
    this.pageIndex = 0;
    if (termo) {
      this.router.navigate(['/admin/promocoes/filtro/nome', termo]);
    } else {
      this.router.navigate(['/admin/promocoes']);
    }
  }

  limparFiltro(input?: HTMLInputElement): void {
    if (input) {
      input.value = '';
    }
    this.filtroNome = '';
    this.pageIndex = 0;
    this.router.navigate(['/admin/promocoes']);
  }

  abrirDetalhes(promocao: PromocaoRequest): void {
    this.dialog.open(PromocaoDetalhesDialog, {
      width: '720px',
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: '90vh',
      data: promocao,
    });
  }

  excluirPromocao(promocao: PromocaoRequest): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Promoção',
        mensagem: `Deseja realmente excluir a promoção "${promocao.nome}"?`
      }
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (!confirmado) {
        return;
      }

      this.promocaoService.delete(promocao.id).subscribe({
        next: () => this.carregarListaAtual(),
        error: (err) => console.error('Erro ao excluir promoções', err)
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
      this.carregarPromocaoPorNome(this.filtroNome);
    } else {
      this.carregarPromocoes();
    }
  }
}
