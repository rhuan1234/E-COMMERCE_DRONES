import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Drone } from '../../../../core/models/drone/Drone';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DroneFiltroParams, DroneService } from '../../../../core/services/DroneService';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { DroneDetalhesDialog } from '../drone-detalhes-dialog/drone-detalhes-dialog';

export type CampoFiltroDrone = 'nome' | 'marca' | 'modelo' | 'min' | 'max';

@Component({
  imports: [
    FormsModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatBadgeModule,
    MatSnackBarModule,
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

  filtroNome = '';
  filtroMarca = '';
  filtroModelo = '';
  precoMin: number | null = null;
  precoMax: number | null = null;

  nomeAplicado = '';
  marcaAplicada = '';
  modeloAplicado = '';
  precoMinAplicado: number | null = null;
  precoMaxAplicado: number | null = null;

  filtroAtivo = false;
  menuFiltrosAberto = false;

  constructor(
    private droneService: DroneService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.filtroNome = params['nome'] ? String(params['nome']).trim() : '';
      this.filtroMarca = params['marca'] ? String(params['marca']).trim() : '';
      this.filtroModelo = params['modelo'] ? String(params['modelo']).trim() : '';

      const minParam = params['min'] !== undefined && params['min'] !== '' ? Number(params['min']) : null;
      const maxParam = params['max'] !== undefined && params['max'] !== '' ? Number(params['max']) : null;

      this.precoMin = minParam !== null && !Number.isNaN(minParam) ? minParam : null;
      this.precoMax = maxParam !== null && !Number.isNaN(maxParam) ? maxParam : null;

      this.nomeAplicado = this.filtroNome;
      this.marcaAplicada = this.filtroMarca;
      this.modeloAplicado = this.filtroModelo;
      this.precoMinAplicado = this.precoMin;
      this.precoMaxAplicado = this.precoMax;

      this.filtroAtivo = this.quantidadeFiltrosAtivos > 0;

      this.carregarListaAtual();
    });
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.menuFiltrosAberto) {
      this.fecharMenuFiltros();
    }
  }

  get quantidadeFiltrosAtivos(): number {
    let count = 0;
    if (this.nomeAplicado) count++;
    if (this.marcaAplicada) count++;
    if (this.modeloAplicado) count++;
    if (this.precoMinAplicado !== null) count++;
    if (this.precoMaxAplicado !== null) count++;
    return count;
  }

  get temCamposPreenchidos(): boolean {
    return Boolean(
      this.filtroNome.trim() ||
      this.filtroMarca.trim() ||
      this.filtroModelo.trim() ||
      this.precoMin !== null ||
      this.precoMax !== null,
    );
  }

  toggleMenuFiltros(): void {
    this.menuFiltrosAberto = !this.menuFiltrosAberto;
  }

  fecharMenuFiltros(): void {
    this.menuFiltrosAberto = false;
  }

  aplicarFiltro(): void {
    if ((this.precoMin !== null && this.precoMin < 0) || (this.precoMax !== null && this.precoMax < 0)) {
      this.snackBar.open('Os valores de preço devem ser maiores ou iguais a zero.', 'Fechar', {
        duration: 3500,
      });
      return;
    }

    if (this.precoMin !== null && this.precoMax !== null && this.precoMin > this.precoMax) {
      this.snackBar.open('O preço mínimo não pode ser maior que o preço máximo.', 'Fechar', {
        duration: 3500,
      });
      return;
    }

    this.pageIndex = 0;
    const queryParams: Params = {};

    const nome = (this.filtroNome || '').trim();
    const marca = (this.filtroMarca || '').trim();
    const modelo = (this.filtroModelo || '').trim();

    if (nome) {
      queryParams['nome'] = nome;
    }
    if (marca) {
      queryParams['marca'] = marca;
    }
    if (modelo) {
      queryParams['modelo'] = modelo;
    }
    if (this.precoMin !== null && !Number.isNaN(this.precoMin)) {
      queryParams['min'] = this.precoMin;
    }
    if (this.precoMax !== null && !Number.isNaN(this.precoMax)) {
      queryParams['max'] = this.precoMax;
    }

    this.menuFiltrosAberto = false;
    this.router.navigate(['/drones'], { queryParams });
  }

  removerFiltroIndividual(campo: CampoFiltroDrone): void {
    switch (campo) {
      case 'nome':
        this.filtroNome = '';
        break;
      case 'marca':
        this.filtroMarca = '';
        break;
      case 'modelo':
        this.filtroModelo = '';
        break;
      case 'min':
        this.precoMin = null;
        break;
      case 'max':
        this.precoMax = null;
        break;
    }
    this.aplicarFiltro();
  }

  limparFiltro(): void {
    this.filtroNome = '';
    this.filtroMarca = '';
    this.filtroModelo = '';
    this.precoMin = null;
    this.precoMax = null;
    this.filtroAtivo = false;
    this.menuFiltrosAberto = false;
    this.pageIndex = 0;
    this.router.navigate(['/drones']);
  }

  carregarDrones(): void {
    this.carregarListaAtual();
  }

  carregarListaAtual(): void {
    const filtros: DroneFiltroParams = {
      nome: this.nomeAplicado,
      marca: this.marcaAplicada,
      modelo: this.modeloAplicado,
      min: this.precoMinAplicado,
      max: this.precoMaxAplicado,
    };

    this.droneService.findAll(this.pageIndex, this.pageSize, filtros).subscribe({
      next: (drones) => {
        this.dataSource.data = drones.items ?? [];
        this.pageIndex = drones.page ?? 0;
        this.pageSize = drones.pageSize ?? this.pageSize;
        this.totalItems = drones.totalItems ?? 0;
      },
      error: (err) => {
        this.dataSource.data = [];
        this.totalItems = 0;
        if (err?.status && err.status !== 400 && err.status !== 404) {
          this.snackBar.open('Erro ao consultar drones. Tente novamente.', 'Fechar', {
            duration: 3500,
          });
        }
      },
    });
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
          this.carregarListaAtual();
        },
        error: (err) => {
          console.error('Erro ao excluir drone', err);
          this.snackBar.open('Não foi possível excluir o drone.', 'Fechar', {
            duration: 3500,
          });
        },
      });
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.carregarListaAtual();
  }

  abrirDetalhes(drone: Drone): void {
    this.dialog.open(DroneDetalhesDialog, {
      width: '720px',
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: '90vh',
      data: drone,
    });
  }
}
