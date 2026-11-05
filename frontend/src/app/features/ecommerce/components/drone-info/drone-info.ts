import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EMPTY, Observable, catchError, expand, reduce, switchMap, tap } from 'rxjs';
import { Drone, DroneImagem } from '../../../../core/models/drone/Drone';
import { PagedResponse } from '../../../../core/models/PagedResponse';
import { AuthService } from '../../../../core/services/auth/AuthService';
import { ComparacaoService } from '../../../../core/services/ComparacaoService';
import { DroneService } from '../../../../core/services/DroneService';
import { FavoritoService } from '../../../../core/services/FavoritoService';

@Component({
  imports: [MatIconModule, RouterLink],
  selector: 'app-drone-info',
  styleUrl: './drone-info.css',
  templateUrl: './drone-info.html',
})
export class DroneInfo implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  readonly comparacao = inject(ComparacaoService);
  readonly mensagemComparacao = signal('');
  private readonly moeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  private readonly numero = new Intl.NumberFormat('pt-BR');
  private readonly paginaFavoritos = 100;
  readonly drone = signal<Drone | null>(null);
  readonly carregando = signal(true);
  readonly erro = signal('');
  readonly imagemSelecionadaId = signal<number | null>(null);
  readonly imagensComFalha = signal<ReadonlySet<number>>(new Set());
  readonly imagensOrdenadas = computed(() =>
    [...(this.drone()?.imagens ?? [])].sort((a, b) => a.ordem - b.ordem),
  );
  readonly imagemPrincipal = computed(() => {
    const imagens = this.imagensOrdenadas();
    return imagens.find((imagem) => imagem.id === this.imagemSelecionadaId())
      ?? imagens.find((imagem) => imagem.principal)
      ?? imagens[0]
      ?? null;
  });
  readonly favorito = signal(false);
  readonly carregandoFavorito = signal(false);
  readonly atualizandoFavorito = signal(false);
  readonly erroFavorito = signal('');
  readonly mensagemFavorito = signal('');
  readonly mensagemCarrinho = signal('');
  readonly favoritoPodeSerExibido = computed(() =>
    !this.authService.isAuthenticated() || !this.carregandoFavorito(),
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly droneService: DroneService,
    private readonly favoritoService: FavoritoService,
    private readonly authService: AuthService,
  ) {}

  alternarComparacao(produto: Drone): void {
    const adicionou = !this.comparacao.contem(produto.id);
    if (!this.comparacao.alternar({ id: produto.id, nome: produto.nome })) {
      this.mensagemComparacao.set(
        `A comparação já tem ${this.comparacao.limite} drones. Remova um na página de comparação.`,
      );
      return;
    }
    this.mensagemComparacao.set(adicionou ? 'Drone adicionado à comparação.' : 'Drone removido da comparação.');
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap(() => {
          this.carregando.set(true);
          this.erro.set('');
          this.drone.set(null);
          this.imagemSelecionadaId.set(null);
          this.imagensComFalha.set(new Set());
        }),
        switchMap((params) => {
          const id = Number(params.get('id'));
          if (!Number.isInteger(id) || id <= 0) {
            this.erro.set('O drone solicitado não foi encontrado.');
            this.carregando.set(false);
            return EMPTY;
          }

          return this.buscarDrone(id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  carregarDrone(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isInteger(id) && id > 0) {
      this.carregando.set(true);
      this.erro.set('');
      this.drone.set(null);
      this.buscarDrone(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }
  }

  selecionarImagem(imagem: DroneImagem): void {
    this.imagemSelecionadaId.set(imagem.id);
  }

  marcarImagemComFalha(imagemId: number): void {
    this.imagensComFalha.update((atuais) => new Set(atuais).add(imagemId));
  }

  obterUrlImagem(imagem: DroneImagem): string {
    return this.droneService.obterUrlImagem(imagem);
  }

  formatarPreco(valor: number): string {
    return this.moeda.format(valor);
  }

  formatarNumero(valor: number): string {
    return this.numero.format(valor);
  }

  alternarFavorito(): void {
    const drone = this.drone();
    if (!drone) {
      return;
    }

    if (!this.authService.isAuthenticated()) {
      void this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/drone-info/${drone.id}` },
      });
      return;
    }

    if (this.atualizandoFavorito() || this.carregandoFavorito()) {
      return;
    }

    const eraFavorito = this.favorito();
    this.atualizandoFavorito.set(true);
    this.erroFavorito.set('');
    this.mensagemFavorito.set('');
    const requisicao = eraFavorito
      ? this.favoritoService.remover(drone.id)
      : this.favoritoService.adicionar(drone.id);

    requisicao.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.favorito.set(!eraFavorito);
        this.mensagemFavorito.set(
          eraFavorito
            ? 'Produto removido dos favoritos.'
            : 'Produto adicionado aos favoritos.',
        );
        this.atualizandoFavorito.set(false);
      },
      error: (error: unknown) => {
        console.error('Erro ao atualizar favorito do drone:', error);
        this.erroFavorito.set('Não foi possível atualizar seus favoritos. Tente novamente.');
        this.atualizandoFavorito.set(false);
      },
    });
  }

  recarregarEstadoFavorito(): void {
    const drone = this.drone();
    if (drone) {
      this.carregarEstadoFavorito(drone.id);
    }
  }

  adicionarAoCarrinho(): void {
    this.mensagemCarrinho.set('O carrinho ainda não está disponível.');
  }

  private carregarEstadoFavorito(droneId: number): void {
    if (!this.authService.isAuthenticated()) {
      this.carregandoFavorito.set(false);
      return;
    }

    this.carregandoFavorito.set(true);
    this.erroFavorito.set('');
    this.listarTodosFavoritos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (drones) => {
          if (this.drone()?.id !== droneId) {
            return;
          }
          this.favorito.set(drones.some((drone) => drone.id === droneId));
          this.carregandoFavorito.set(false);
        },
        error: (error: unknown) => {
          if (this.drone()?.id !== droneId) {
            return;
          }
          console.error('Erro ao consultar favorito do drone:', error);
          this.erroFavorito.set('Não foi possível consultar seu estado de favoritos.');
          this.carregandoFavorito.set(false);
        },
      });
  }

  private listarTodosFavoritos(): Observable<Drone[]> {
    return this.favoritoService.listar(0, this.paginaFavoritos).pipe(
      expand((resposta) =>
        resposta.page + 1 < resposta.totalPages
          ? this.favoritoService.listar(resposta.page + 1, this.paginaFavoritos)
          : EMPTY,
      ),
      reduce((drones, resposta: PagedResponse<Drone>) => [...drones, ...resposta.items], [] as Drone[]),
    );
  }

  private buscarDrone(id: number): Observable<Drone> {
    return this.droneService.findByIdEcommerce(id).pipe(
      tap((drone) => {
        this.drone.set(drone);
        this.imagemSelecionadaId.set(
          drone.imagens?.find((imagem) => imagem.principal)?.id
            ?? drone.imagens?.[0]?.id
            ?? null,
        );
        this.carregando.set(false);
        this.carregarEstadoFavorito(drone.id);
      }),
      catchError((error: unknown) => {
        console.error('Erro ao carregar detalhes do drone:', error);
        this.erro.set(
          this.statusDoErro(error) === 404
            ? 'Este drone não foi encontrado ou não está mais disponível.'
            : 'Não foi possível carregar os detalhes do drone. Tente novamente.',
        );
        this.carregando.set(false);
        return EMPTY;
      }),
    );
  }

  private statusDoErro(error: unknown): number | undefined {
    if (typeof error === 'object' && error !== null && 'status' in error) {
      const status = error.status;
      return typeof status === 'number' ? status : undefined;
    }
    return undefined;
  }
}
