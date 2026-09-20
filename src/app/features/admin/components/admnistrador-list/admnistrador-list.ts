import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { Administrador } from '../../../../core/models/administrador/Administrado';
import { AdministradorService } from '../../../../core/services/AdministradorService';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  imports: [MatTableModule, MatInputModule, MatFormFieldModule,
    MatToolbarModule, MatButtonModule, MatIconModule, RouterLink, MatDialogModule],
  selector: 'app-admnistrador-list',
  styleUrl: './admnistrador-list.css',
  templateUrl: './admnistrador-list.html',
})
export class AdmnistradorList {
  displayedColumns: string[] = ['id', 'login', "email", 'acao' ];
  dataSource = new MatTableDataSource<Administrador>();

  constructor(
    private administradorService: AdministradorService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.carregarAdministradores();
  }

  carregarAdministradores(): void {
    this.administradorService.findAll().subscribe((administradores) => {
      this.dataSource.data = administradores;
    });
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
        next: () => this.carregarAdministradores(),
        error: (err) => console.error('Erro ao excluir administrador', err)
      });
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
