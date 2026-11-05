import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Administrador } from '../../../../core/models/administrador/Administrado';
import { AdministradorService } from '../../../../core/services/AdministradorService';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

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
  selector: 'app-admnistrador-list',
  styleUrl: './admnistrador-list.css',
  templateUrl: './admnistrador-list.html',
})
export class AdmnistradorList implements OnInit {
  displayedColumns: string[] = ['id', 'login', 'email', 'acao'];
  dataSource = new MatTableDataSource<Administrador>();
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;
  filtroLogin = '';

  constructor(
    private administradorService: AdministradorService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
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
    this.administradorService.findAll(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        this.dataSource.data = response.items;
        this.pageIndex = response.page;
        this.pageSize = response.pageSize;
        this.totalItems = response.totalItems;
      },
      error: (err) => console.error('Erro ao carregar administradores', err),
    });
  }

  carregarAdministradorPorLogin(login: string): void {
    this.administradorService.findByLogin(this.pageIndex, this.pageSize, login).subscribe({
      next: (response) => {
        this.dataSource.data = response.items;
        this.pageIndex = response.page;
        this.pageSize = response.pageSize;
        this.totalItems = response.totalItems;
      },
      error: (err) => console.error('Erro ao carregar administradores por login', err),
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

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (!confirmado) {
        return;
      }
      
      this.administradorService.delete(administrador.id).subscribe({
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
