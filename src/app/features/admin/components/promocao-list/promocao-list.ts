import { Component } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { PromocaoRequest } from '../../../../core/models/promocao/PromocaoRequest';
import { PromocaoService } from '../../../../core/services/PromocaoService';


@Component({
  imports: [MatTableModule, MatInputModule, MatFormFieldModule,
    MatToolbarModule, MatButtonModule, MatIconModule, RouterLink, MatDialogModule],
  selector: 'app-promocao-list',
  styleUrl: './promocao-list.css',
  templateUrl: './promocao-list.html',
})
export class PromocaoList {
  displayedColumns: string[] = ['id', 'nome', 'desconto', 'inicio', 'fim', 'drones', 'acao'];
  dataSource = new MatTableDataSource<PromocaoRequest>();

  constructor(
    private promocaoService: PromocaoService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.carregarPromocoes();
  }

  carregarPromocoes(): void {
    this.promocaoService.findAll().subscribe((promocoes) => {
      this.dataSource.data = promocoes;
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
        next: () => this.carregarPromocoes(),
        error: (err) => console.error('Erro ao excluir promoções', err)
      });
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
