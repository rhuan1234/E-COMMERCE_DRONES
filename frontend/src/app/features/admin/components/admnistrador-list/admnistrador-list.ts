import { Component, OnInit, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AdminPageHeader } from '../admin-page-header/admin-page-header';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Administrador } from '../../../../core/models/administrador/Administrado';
import { AdministradorService } from '../../../../core/services/AdministradorService';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

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
  selector: 'app-admnistrador-list',
  styleUrl: './admnistrador-list.css',
  templateUrl: './admnistrador-list.html',
})
export class AdmnistradorList implements OnInit {
  /** O app roda sem Zone.js: avisa o Angular quando uma resposta assíncrona muda o estado. */
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  displayedColumns: string[] = ['id', 'login', 'email', 'acao'];
  dataSource = new MatTableDataSource<Administrador>();
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;
  carregando = false;
  erroCarregamento = false;
  filtroLogin = '';

  constructor(
    private administradorService: AdministradorService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const login = params['login'];
        if (login && login.trim()) {
          this.filtroLogin = login.trim();
          this.carregarAdministradorPorLogin(this.filtroLogin);
        } else {
          this.filtroLogin = '';
          this.carregarAdministradores();
        }
      });
  }

  carregarAdministradores(): void {
    this.carregando = true;
    this.erroCarregamento = false;
    this.cdr.markForCheck();
    this.administradorService
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
        console.error('Erro ao carregar administradores', err);
        this.cdr.markForCheck();
      },
    });
  }

  carregarAdministradorPorLogin(login: string): void {
    this.carregando = true;
    this.erroCarregamento = false;
    this.cdr.markForCheck();
    this.administradorService
      .findByLogin(this.pageIndex, this.pageSize, login)
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
        console.error('Erro ao carregar administradores por login', err);
        this.cdr.markForCheck();
      },
    });
  }

  filtrarPorLogin(login: string): void {
    const termo = (login || '').trim();
    this.pageIndex = 0;
    if (termo) {
      this.router.navigate(['/admin/administradores/filtro/login', termo]);
    } else {
      this.router.navigate(['/admin/administradores']);
    }
  }

  limparFiltro(input?: HTMLInputElement): void {
    if (input) {
      input.value = '';
    }
    this.filtroLogin = '';
    this.pageIndex = 0;
    this.router.navigate(['/admin/administradores']);
  }

  excluirAdministrador(administrador: Administrador): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Administrador',
        mensagem: `Deseja realmente excluir o administrador "${administrador.login}"?`
      }
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmado) => {
        if (!confirmado) {
          return;
        }

        this.administradorService
          .delete(administrador.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => this.carregarListaAtual(),
            error: (err) => console.error('Erro ao excluir administrador', err)
          });
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.carregarListaAtual();
  }

  private carregarListaAtual(): void {
    if (this.filtroLogin) {
      this.carregarAdministradorPorLogin(this.filtroLogin);
    } else {
      this.carregarAdministradores();
    }
  }
}
