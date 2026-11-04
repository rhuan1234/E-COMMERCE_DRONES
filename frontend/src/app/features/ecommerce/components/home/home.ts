import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EMPTY, Subject, catchError, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Drone, DroneImagem } from '../../../../core/models/drone/Drone';
import { DroneCatalogFeature, DroneCatalogFilters } from '../../../../core/models/drone/DroneCatalogFilters';
import { DroneService } from '../../../../core/services/DroneService';

interface FilterGroup {
  title: string;
  key: 'alcance' | 'autonomia' | 'camera';
  options: { label: string; value: string }[];
}

@Component({
  imports: [FormsModule, MatIconModule],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly filtros$ = new Subject<DroneCatalogFilters>();
  readonly dronesPorPagina = 12;
  readonly filterGroups: FilterGroup[] = [
    {
      title: 'Alcance',
      key: 'alcance',
      options: [
        { label: 'Acima de 50m até 10km', value: 'ATE_10KM' },
        { label: 'Acima de 10km até 20km', value: 'DE_10_A_20KM' },
        { label: 'Acima de 20km até 50km', value: 'DE_20_A_50KM' },
        { label: 'Acima de 50km', value: 'ACIMA_50KM' },
      ],
    },
    {
      title: 'Autonomia de voo',
      key: 'autonomia',
      options: [
        { label: 'Até 20 min', value: 'ATE_20_MIN' },
        { label: '20 a 40 min', value: 'DE_20_A_40_MIN' },
        { label: 'Acima de 40 min', value: 'ACIMA_40_MIN' },
      ],
    },
    {
      title: 'Câmera',
      key: 'camera',
      options: [
        { label: 'Full HD', value: 'FULL_HD' },
        { label: '4K', value: '4K' },
        { label: 'Estabilização de imagem', value: 'ESTABILIZACAO' },
      ],
    },
  ];
  readonly featureFilters: { label: string; value: DroneCatalogFeature }[] = [
    { label: 'Possui GPS', value: 'possuiGPS' },
    { label: 'Possui controle remoto', value: 'comControleRemoto' },
    { label: 'Controlado por aplicativo', value: 'controladoPorAplicativo' },
  ];
  readonly selectedFilters = new Set<string>();
  readonly selectedFeatures = new Set<DroneCatalogFeature>();
  readonly drones = signal<Drone[]>([]);
  readonly carregandoDrones = signal(true);
  readonly mensagemErroDrones = signal('');
  readonly imagensComFalha = new Set<number>();
  precoMinimo: number | null = null;
  precoMaximo: number | null = null;
  private readonly formatadorMoeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  constructor(private readonly droneService: DroneService) {}

  ngOnInit(): void {
    this.filtros$
      .pipe(
        tap(() => {
          this.carregandoDrones.set(true);
          this.mensagemErroDrones.set('');
        }),
        switchMap((filtros) =>
          this.droneService.findAllEcommerce(0, this.dronesPorPagina, filtros).pipe(
            tap((response) => {
              this.drones.set(response.items ?? []);
              this.imagensComFalha.clear();
              this.carregandoDrones.set(false);
            }),
            catchError((error: unknown) => {
              console.error('Erro ao carregar drones da loja:', error);
              this.mensagemErroDrones.set('Não foi possível carregar os drones. Tente novamente mais tarde.');
              this.carregandoDrones.set(false);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    this.aplicarFiltros();
  }

  private filtrosSelecionados(key: FilterGroup['key']): string[] {
    const group = this.filterGroups.find((item) => item.key === key);
    return group?.options
      .filter((option) => this.selectedFilters.has(this.chaveFiltro(key, option.value)))
      .map((option) => option.value) ?? [];
  }

  private chaveFiltro(group: FilterGroup['key'], value: string): string {
    return `${group}:${value}`;
  }

  private valorNumerico(valor: number | null): number | undefined {
    if (valor === null) {
      return undefined;
    }
    return Number.isFinite(valor) ? valor : undefined;
  }

  aplicarFiltros(): void {
    this.filtros$.next({
      min: this.valorNumerico(this.precoMinimo),
      max: this.valorNumerico(this.precoMaximo),
      alcance: this.filtrosSelecionados('alcance'),
      autonomia: this.filtrosSelecionados('autonomia'),
      camera: this.filtrosSelecionados('camera'),
      possuiGPS: this.selectedFeatures.has('possuiGPS') ? true : undefined,
      comControleRemoto: this.selectedFeatures.has('comControleRemoto') ? true : undefined,
      controladoPorAplicativo: this.selectedFeatures.has('controladoPorAplicativo') ? true : undefined,
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
    const priceFilterSelected = this.precoMinimo !== null || this.precoMaximo !== null ? 1 : 0;
    return this.selectedFilters.size + this.selectedFeatures.size + priceFilterSelected;
  }

  get hasActiveFilters(): boolean {
    return this.totalSelectedFilters > 0;
  }

  alternarFiltro(group: FilterGroup['key'], option: string): void {
    const key = this.chaveFiltro(group, option);
    if (this.selectedFilters.has(key)) {
      this.selectedFilters.delete(key);
    } else {
      this.selectedFilters.add(key);
    }
  }

  alternarRecurso(feature: DroneCatalogFeature, selecionado: boolean): void {
    if (selecionado) {
      this.selectedFeatures.add(feature);
      return;
    }

    this.selectedFeatures.delete(feature);
  }

  aoAlterarRecurso(feature: DroneCatalogFeature, event: Event): void {
    const checkbox = event.target;
    if (checkbox instanceof HTMLInputElement) {
      this.alternarRecurso(feature, checkbox.checked);
    }
  }

  limparFiltros(): void {
    this.selectedFilters.clear();
    this.selectedFeatures.clear();
    this.precoMinimo = null;
    this.precoMaximo = null;
  }
}
