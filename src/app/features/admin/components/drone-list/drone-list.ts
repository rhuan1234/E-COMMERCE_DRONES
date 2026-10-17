import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Drone } from '../../../../core/models/drone/Drone';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DroneService } from '../../../../core/services/DroneService';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  selector: 'app-drone-list',
  styleUrl: './drone-list.css',
  templateUrl: './drone-list.html',
})
export class DroneList implements OnInit {
  displayedColumns: string[] = [
    'id',
    'nome',
    'marca',
    'modelo',
    'preco',
    'quantidadeDisponivel',
    'possuiGPS',
    'ativa',
    'acao',
  ];
  dataSource = new MatTableDataSource<Drone>();
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;
  filtroModelo = '';

  constructor(
    private droneService: DroneService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const modelo = params['modelo'];
      if (modelo && modelo.trim()) {
        this.filtroModelo = modelo.trim();
        this.carregarDronePorModelo(this.filtroModelo);
      } else {
        this.filtroModelo = '';
        this.carregarDrones();
      }
    });
  }

  carregarDrones(): void {
    this.droneService.findAll(this.pageIndex, this.pageSize).subscribe((drones) => {
      this.dataSource.data = drones.items;
      this.pageIndex = drones.page;
      this.pageSize = drones.pageSize;
      this.totalItems = drones.totalItems;
    });
  }

  carregarDronePorModelo(modelo: string): void {
    this.droneService.findByModelo(this.pageIndex, this.pageSize, modelo).subscribe((drones) => {
      this.dataSource.data = drones.items;
      this.pageIndex = drones.page;
      this.pageSize = drones.pageSize;
      this.totalItems = drones.totalItems;
    });
  }

  filtrarPorModelo(modelo: string): void {
    const termo = (modelo || '').trim();
    this.pageIndex = 0;
    if (termo) {
      this.router.navigate(['/drones/filtro/modelo', termo]);
    } else {
      this.router.navigate(['/drones']);
    }
  }

  limparFiltro(input?: HTMLInputElement): void {
    if (input) {
      input.value = '';
    }
    this.filtroModelo = '';
    this.pageIndex = 0;
    this.router.navigate(['/drones']);
  }

  excluirDrone(drone: Drone): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Drone',
        mensagem: `Deseja realmente excluir o drone "${drone.nome}"?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (!confirmado) {
        return;
      }
      this.droneService.delete(drone.id!).subscribe({
        next: () => {
          if (this.filtroModelo) {
            this.carregarDronePorModelo(this.filtroModelo);
          } else {
            this.carregarDrones();
          }
        },
        error: (err) => console.error('Erro ao excluir drone', err),
      });
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    if (this.filtroModelo) {
      this.carregarDronePorModelo(this.filtroModelo);
    } else {
      this.carregarDrones();
    }
  }
}
