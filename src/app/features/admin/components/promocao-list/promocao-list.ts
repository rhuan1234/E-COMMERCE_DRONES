import { Component, OnInit } from '@angular/core';
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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PromocaoService } from '../../../../core/services/PromocaoService';

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

  constructor(
    private promocaoService: PromocaoService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.carregarPromocoes();
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

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.carregarPromocoes();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
