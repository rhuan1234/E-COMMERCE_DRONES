import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EMPTY, Observable, Subject, catchError, expand, forkJoin, map, reduce, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Drone, DroneImagem } from '../../../../core/models/drone/Drone';
import { DroneCatalogFeature, DroneCatalogFilters } from '../../../../core/models/drone/DroneCatalogFilters';
import { PagedResponse } from '../../../../core/models/PagedResponse';
import { AuthService } from '../../../../core/services/auth/AuthService';
import { DroneService } from '../../../../core/services/DroneService';
import { EcommerceCatalogSearchService } from '../../../../core/services/EcommerceCatalogSearchService';
import { FavoritoService } from '../../../../core/services/FavoritoService';

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
  private filtrosAplicados: DroneCatalogFilters = {};
  private termoBusca = '';
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
  readonly favoritosIds = signal<ReadonlySet<number>>(new Set());
  readonly favoritosEmAtualizacao = signal<ReadonlySet<number>>(new Set());
  readonly mensagemErroFavoritos = signal('');
  readonly mensagemSucessoFavoritos = signal('');
  precoMinimo: number | null = null;
  precoMaximo: number | null = null;
  private readonly formatadorMoeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  ngOnInit(): void {
    this.filtros$
      .pipe(
        tap(() => {
          this.carregandoDrones.set(true);
          this.mensagemErroDrones.set('');
        }),
        switchMap((filtros) =>
          this.buscarCatalogo(filtros).pipe(
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

    if (this.authService.isAuthenticated()) {
      this.listarTodosFavoritos()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (favoritos) => this.favoritosIds.set(new Set(favoritos.map((drone) => drone.id))),
          error: (error: unknown) => {
            console.error('Erro ao carregar favoritos:', error);
            this.mensagemErroFavoritos.set('Não foi possível carregar seu estado de favoritos.');
          },
        });
    }

    this.catalogSearch.searchTerm$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((termo) => {
        this.termoBusca = termo;
        this.filtros$.next(this.filtrosAplicados);
      });
  }

  constructor(
    private readonly droneService: DroneService,
    private readonly catalogSearch: EcommerceCatalogSearchService,
    private readonly favoritoService: FavoritoService,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  private listarTodosFavoritos(): Observable<Drone[]> {
    const pageSize = 100;
    return this.favoritoService.listar(0, pageSize).pipe(
      expand((resposta) =>
        resposta.page + 1 < resposta.totalPages
          ? this.favoritoService.listar(resposta.page + 1, pageSize)
          : EMPTY,
      ),
      reduce((drones, resposta: PagedResponse<Drone>) => [...drones, ...resposta.items], [] as Drone[]),
    );
  }

  alternarFavorito(drone: Drone): void {
    if (!this.authService.isAuthenticated()) {
      void this.router.navigate(['/login'], { queryParams: { returnUrl: '/home' } });
      return;
    }

    if (this.favoritosEmAtualizacao().has(drone.id)) {
      return;
    }

    const jaFavoritado = this.favoritosIds().has(drone.id);
    this.atualizarFavoritosEmAtualizacao(drone.id, true);
    this.mensagemErroFavoritos.set('');
    this.mensagemSucessoFavoritos.set('');
    const requisicao = jaFavoritado
      ? this.favoritoService.remover(drone.id)
      : this.favoritoService.adicionar(drone.id);

    requisicao.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        const ids = new Set(this.favoritosIds());
        if (jaFavoritado) {
          ids.delete(drone.id);
          this.mensagemSucessoFavoritos.set(`${drone.nome} foi removido dos favoritos.`);
        } else {
          ids.add(drone.id);
          this.mensagemSucessoFavoritos.set(`${drone.nome} foi adicionado aos favoritos.`);
        }
        this.favoritosIds.set(ids);
        this.atualizarFavoritosEmAtualizacao(drone.id, false);
      },
      error: (error: unknown) => {
        console.error('Erro ao atualizar favorito:', error);
        this.mensagemErroFavoritos.set('Não foi possível atualizar seus favoritos. Tente novamente.');
        this.atualizarFavoritosEmAtualizacao(drone.id, false);
      },
    });
  }

  private atualizarFavoritosEmAtualizacao(droneId: number, emAtualizacao: boolean): void {
    const ids = new Set(this.favoritosEmAtualizacao());
    if (emAtualizacao) {
      ids.add(droneId);
    } else {
      ids.delete(droneId);
    }
    this.favoritosEmAtualizacao.set(ids);
  }

  private buscarCatalogo(filtros: DroneCatalogFilters) {
    if (!this.termoBusca) {
      return this.droneService.findAllEcommerce(0, this.dronesPorPagina, filtros);
    }

    return forkJoin([
      this.droneService.findAllEcommerce(0, this.dronesPorPagina, {
        ...filtros,
        nome: this.termoBusca,
      }),
      this.droneService.findAllEcommerce(0, this.dronesPorPagina, {
        ...filtros,
        modelo: this.termoBusca,
      }),
    ]).pipe(
      map(([porNome, porModelo]) => {
        const items = [...new Map(
          [...porNome.items, ...porModelo.items].map((drone) => [drone.id, drone]),
        ).values()];
        return {
          ...porNome,
          items,
          totalItems: items.length,
          totalPages: Math.ceil(items.length / this.dronesPorPagina),
        };
      }),
    );
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
    this.filtrosAplicados = {
      min: this.valorNumerico(this.precoMinimo),
      max: this.valorNumerico(this.precoMaximo),
      alcance: this.filtrosSelecionados('alcance'),
      autonomia: this.filtrosSelecionados('autonomia'),
      camera: this.filtrosSelecionados('camera'),
      possuiGPS: this.selectedFeatures.has('possuiGPS') ? true : undefined,
      comControleRemoto: this.selectedFeatures.has('comControleRemoto') ? true : undefined,
      controladoPorAplicativo: this.selectedFeatures.has('controladoPorAplicativo') ? true : undefined,
    };
    this.filtros$.next(this.filtrosAplicados);
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
