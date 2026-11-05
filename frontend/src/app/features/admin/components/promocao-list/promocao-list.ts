import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AdminPageHeader } from '../admin-page-header/admin-page-header';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { PromocaoRequest } from '../../../../core/models/promocao/PromocaoRequest';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PromocaoService } from '../../../../core/services/PromocaoService';
import { PromocaoDetalhesDialog } from '../promocao-detalhes-dialog/promocao-detalhes-dialog';

@Component({
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatProgressBarModule,
    AdminPageHeader,
    DatePipe,
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
  /** O app roda sem Zone.js: avisa o Angular quando uma resposta assíncrona muda o estado. */
  private readonly cdr = inject(ChangeDetectorRef);

  displayedColumns: string[] = ['id', 'nome', 'desconto', 'inicio', 'fim', 'status', 'drones', 'acao'];
  dataSource = new MatTableDataSource<PromocaoRequest>();
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;
  carregando = false;
  erroCarregamento = false;
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
    this.carregando = true;
    this.erroCarregamento = false;
    this.promocaoService.findAll(this.pageIndex, this.pageSize).subscribe({
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
        console.error('Erro ao carregar promoções', err);
      },
    });
  }

  carregarPromocaoPorNome(nome: string): void {
    this.carregando = true;
    this.erroCarregamento = false;
    this.promocaoService.findByNome(this.pageIndex, this.pageSize, nome).subscribe({
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
        console.error('Erro ao carregar promoções por nome', err);
      },
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

  /**
   * Situação da campanha em relação ao momento atual, conforme a regra de vigência
   * (agora >= dataInicio && agora <= dataFim).
   */
  statusPromocao(promocao: PromocaoRequest, agora: Date = new Date()): 'vigente' | 'agendada' | 'encerrada' {
    const inicio = new Date(promocao.dataInicio).getTime();
    const fim = new Date(promocao.dataFim).getTime();
    const instante = agora.getTime();
    if (instante < inicio) {
      return 'agendada';
    }
    return instante <= fim ? 'vigente' : 'encerrada';
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
