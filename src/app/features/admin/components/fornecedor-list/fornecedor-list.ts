import { Component, OnInit } from '@angular/core';
import { Fornecedor } from '../../../../core/models/fornecedor/FornecedorRequest';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FornecedorService } from '../../../../core/services/FornecedorService';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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
  selector: 'app-fornecedor-list',
  styleUrl: './fornecedor-list.css',
  templateUrl: './fornecedor-list.html',
})
export class FornecedorList implements OnInit {
  displayedColumns: string[] = ['id', 'nome', 'cnpj', 'telefone', 'email', 'ativo', 'acao'];
  dataSource = new MatTableDataSource<Fornecedor>();
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;

  constructor(
    private fornecedorService: FornecedorService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.carregarFornecedores();
  }

  carregarFornecedores(): void {
    this.fornecedorService.findAll(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        this.dataSource.data = response.items;
        this.pageIndex = response.page;
        this.pageSize = response.pageSize;
        this.totalItems = response.totalItems;
      },
      error: (err) => console.error('Erro ao carregar fornecedores', err),
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
        next: () => this.carregarFornecedores(),
        error: (err) => console.error('Erro ao excluir fornecedor', err)
      });
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.carregarFornecedores();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}