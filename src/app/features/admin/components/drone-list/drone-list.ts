import { Component } from '@angular/core';
import {Drone} from '../../../../core/models/drone/Drone';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DroneService } from '../../../../core/services/DroneService';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
@Component({
  imports: [
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    MatDialogModule
  ],
  selector: 'app-drone-list',
  styleUrl: './drone-list.css',
  templateUrl: './drone-list.html',
})
export class DroneList {
  displayedColumns: string[] = [
    'id',
    'nome',
    'marca',
    'modelo',
    'preco',
    'quantidadeDisponivel',
    'possuiCamera',
    'possuiGPS',
    'ativa',
    'acao'
  ];
  dataSource = new MatTableDataSource<Drone>();

  constructor(
    private droneService: DroneService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.carregarDrones();
  }
  carregarDrones(): void {

    this.droneService.findAll().subscribe((drones) => {
      this.dataSource.data = drones;

    });
  }
  excluirDrone(drone: Drone): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Excluir Drone',
        mensagem: `Deseja realmente excluir o drone "${drone.nome}"?`
      }

    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (!confirmado) {
        return;
      }
      this.droneService.delete(drone.id!).subscribe({
        next: () => this.carregarDrones(),
        error: (err) =>
          console.error('Erro ao excluir drone', err)
      });
    });
  }


  applyFilter(event: Event) {
    const filterValue =
      (event.target as HTMLInputElement).value;
    this.dataSource.filter =
      filterValue.trim().toLowerCase();
  }

}