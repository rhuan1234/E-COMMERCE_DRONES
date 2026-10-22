import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Drone, DroneImagem } from '../../../../core/models/drone/Drone';
import { DroneService } from '../../../../core/services/DroneService';

interface FilterGroup {
  title: string;
  options: string[];
}

@Component({
  imports: [FormsModule, MatIconModule],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  readonly dronesPorPagina = 12;
  readonly filterGroups: FilterGroup[] = [
    {
      title: 'Alcance',
      options: ['Acima de 50m até 10km', 'Acima de 10km até 20km', 'Acima de 20km até 50km', 'Acima de 50km'],
    },
    {
      title: 'Autonomia de voo',
      options: ['Até 20 min', '20 a 40 min', 'Acima de 40 min'],
    },
    {
      title: 'Câmera',
      options: ['Full HD', '4K', 'Estabilização de imagem'],
    },
  ];
  readonly featureFilters = ['Possui GPS', 'Possui controle remoto', 'Controlado por aplicativo'];
  readonly selectedFilters = new Set<string>();
  readonly selectedFeatures = new Set<string>();
  drones: Drone[] = [];
  carregandoDrones = true;
  mensagemErroDrones = '';
  readonly imagensComFalha = new Set<number>();
  precoMinimo = '';
  precoMaximo = '';
  private readonly formatadorMoeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  constructor(private readonly droneService: DroneService) {}

  ngOnInit(): void {
    this.carregarDrones();
  }

  private carregarDrones(): void {
    this.droneService.findAllEcommerce(0, this.dronesPorPagina).subscribe({
      next: (response) => {
        this.drones = response.items ?? [];
        this.imagensComFalha.clear();
        this.carregandoDrones = false;
      },
      error: (error) => {
        console.error('Erro ao carregar drones da loja:', error);
        this.mensagemErroDrones = 'Não foi possível carregar os drones. Tente novamente mais tarde.';
        this.carregandoDrones = false;
      },
    });
  }

  imagemPrincipal(drone: Drone): DroneImagem | undefined {
    return drone.imagens?.find((imagem) => imagem.principal);
  }

  obterUrlImagem(imagem: DroneImagem): string {
    return this.droneService.obterUrlImagem(imagem);
  }

  marcarImagemComFalha(droneId: number): void {
    this.imagensComFalha.add(droneId);
  }

  formatarPreco(valor: number): string {
    return this.formatadorMoeda.format(valor);
  }

  get totalSelectedFilters(): number {
    const priceFilterSelected = this.precoMinimo !== '' || this.precoMaximo !== '' ? 1 : 0;
    return this.selectedFilters.size + this.selectedFeatures.size + priceFilterSelected;
  }

  get hasActiveFilters(): boolean {
    return this.totalSelectedFilters > 0;
  }

  alternarFiltro(option: string): void {
    if (this.selectedFilters.has(option)) {
      this.selectedFilters.delete(option);
      return;
    }

    this.selectedFilters.add(option);
  }

  alternarRecurso(feature: string, selecionado: boolean): void {
    if (selecionado) {
      this.selectedFeatures.add(feature);
      return;
    }

    this.selectedFeatures.delete(feature);
  }

  aoAlterarRecurso(feature: string, event: Event): void {
    const checkbox = event.target;
    if (checkbox instanceof HTMLInputElement) {
      this.alternarRecurso(feature, checkbox.checked);
    }
  }

  limparFiltros(): void {
    this.selectedFilters.clear();
    this.selectedFeatures.clear();
    this.precoMinimo = '';
    this.precoMaximo = '';
  }
}
