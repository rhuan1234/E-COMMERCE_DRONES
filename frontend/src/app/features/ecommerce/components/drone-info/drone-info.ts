import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Observable, catchError, expand, reduce, switchMap, tap } from 'rxjs';
import { Avaliacao } from '../../../../core/models/drone/Avaliacao';
import { AvaliacaoRequest } from '../../../../core/models/drone/AvaliacaoRequest';
import { Drone, DroneImagem } from '../../../../core/models/drone/Drone';
import { PagedResponse } from '../../../../core/models/PagedResponse';
import { AvaliacaoService } from '../../../../core/services/AvaliacaoService';
import { AuthService } from '../../../../core/services/auth/AuthService';
import { CarrinhoService, ResultadoAdicaoCarrinho } from '../../../../core/services/CarrinhoService';
import { ComparacaoService } from '../../../../core/services/ComparacaoService';
import { DroneService } from '../../../../core/services/DroneService';
import { FavoritoService } from '../../../../core/services/FavoritoService';

@Component({
  imports: [MatIconModule, ReactiveFormsModule, RouterLink],
  selector: 'app-drone-info',
  styleUrl: './drone-info.css',
  templateUrl: './drone-info.html',
})
export class DroneInfo implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  readonly comparacao = inject(ComparacaoService);
  readonly carrinho = inject(CarrinhoService);
  readonly mensagemComparacao = signal('');
  private readonly moeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  private readonly numero = new Intl.NumberFormat('pt-BR');
  private readonly paginaFavoritos = 100;
  readonly tamanhoPaginaAvaliacoes = 5;
  readonly estrelas = [1, 2, 3, 4, 5];
  readonly avaliacaoForm = new FormGroup({
    nota: new FormControl<number | null>(null, [Validators.required, Validators.min(1), Validators.max(5)]),
    comentario: new FormControl('', [Validators.maxLength(1000)]),
  });
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
  readonly avaliacoes = signal<Avaliacao[]>([]);
  readonly paginaAvaliacoes = signal(0);
  readonly totalPaginasAvaliacoes = signal(0);
  readonly totalAvaliacoes = signal(0);
  readonly carregandoAvaliacoes = signal(false);
  readonly erroAvaliacoes = signal('');
  readonly enviandoAvaliacao = signal(false);
  readonly mensagemAvaliacao = signal('');
  readonly favoritoPodeSerExibido = computed(() =>
    !this.authService.isAuthenticated() || !this.carregandoFavorito(),
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly droneService: DroneService,
    private readonly favoritoService: FavoritoService,
    private readonly avaliacaoService: AvaliacaoService,
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

  get usuarioAutenticado(): boolean {
    return this.authService.isAuthenticated();
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
    const drone = this.drone();
    if (!drone) {
      return;
    }

    const resultado = this.carrinho.adicionar(drone);
    this.mensagemCarrinho.set(this.mensagemResultadoCarrinho(drone.nome, resultado));
  }

  private mensagemResultadoCarrinho(nome: string, resultado: ResultadoAdicaoCarrinho): string {
    switch (resultado) {
      case 'adicionado':
        return `${nome} foi adicionado ao carrinho.`;
      case 'indisponivel':
        return `${nome} está sem estoque disponível.`;
      case 'limite-estoque':
        return `Você já adicionou ao carrinho todas as unidades disponíveis de ${nome}.`;
      case 'produto-invalido':
        return 'Não foi possível adicionar este drone ao carrinho.';
    }
  }

  selecionarNota(nota: number): void {
    this.avaliacaoForm.controls.nota.setValue(nota);
    this.avaliacaoForm.controls.nota.markAsTouched();
  }

  carregarPaginaAvaliacoes(pagina: number): void {
    const droneId = this.drone()?.id;
    if (
      droneId === undefined
      || pagina < 0
      || (this.totalPaginasAvaliacoes() > 0 && pagina >= this.totalPaginasAvaliacoes())
      || this.carregandoAvaliacoes()
    ) {
      return;
    }

    this.carregarAvaliacoes(droneId, pagina);
  }

  enviarAvaliacao(): void {
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

    this.avaliacaoForm.markAllAsTouched();
    const nota = this.avaliacaoForm.controls.nota.value;
    if (this.avaliacaoForm.invalid || nota === null || this.enviandoAvaliacao()) {
      return;
    }

    const comentario = (this.avaliacaoForm.controls.comentario.value ?? '').trim();
    const dados: AvaliacaoRequest = {
      nota,
      comentario: comentario || null,
      droneId: drone.id,
    };

    this.enviandoAvaliacao.set(true);
    this.erroAvaliacoes.set('');
    this.mensagemAvaliacao.set('');
    this.avaliacaoService.criar(dados)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.avaliacaoForm.reset({ nota: null, comentario: '' });
          this.enviandoAvaliacao.set(false);
          this.mensagemAvaliacao.set('Sua avaliação foi publicada.');
          this.carregarAvaliacoes(drone.id, 0);
        },
        error: (error: unknown) => {
          console.error('Erro ao enviar avaliação do drone:', error);
          this.erroAvaliacoes.set(this.mensagemErroAvaliacao(error));
          this.enviandoAvaliacao.set(false);
        },
      });
  }

  formatarDataAvaliacao(data: string): string {
    const valor = new Date(data);
    return Number.isNaN(valor.getTime())
      ? 'Data não disponível'
      : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(valor);
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

  private carregarAvaliacoes(droneId: number, pagina: number): void {
    this.carregandoAvaliacoes.set(true);
    this.erroAvaliacoes.set('');
    this.avaliacaoService.listarPorDrone(droneId, pagina, this.tamanhoPaginaAvaliacoes)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resposta: PagedResponse<Avaliacao>) => {
          if (this.drone()?.id !== droneId) {
            return;
          }
          this.avaliacoes.set(resposta.items);
          this.paginaAvaliacoes.set(resposta.page);
          this.totalPaginasAvaliacoes.set(resposta.totalPages);
          this.totalAvaliacoes.set(resposta.totalItems);
          this.carregandoAvaliacoes.set(false);
        },
        error: (error: unknown) => {
          if (this.drone()?.id !== droneId) {
            return;
          }
          console.error('Erro ao carregar avaliações do drone:', error);
          this.erroAvaliacoes.set('Não foi possível carregar as avaliações. Tente novamente.');
          this.carregandoAvaliacoes.set(false);
        },
      });
  }

  private mensagemErroAvaliacao(error: unknown): string {
    if (
      error instanceof HttpErrorResponse
      && typeof error.error === 'object'
      && error.error !== null
      && 'message' in error.error
      && typeof error.error.message === 'string'
    ) {
      return error.error.message;
    }
    return 'Não foi possível enviar sua avaliação. Verifique se você já avaliou este drone e tente novamente.';
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
        this.avaliacoes.set([]);
        this.paginaAvaliacoes.set(0);
        this.totalPaginasAvaliacoes.set(0);
        this.totalAvaliacoes.set(0);
        this.carregarAvaliacoes(drone.id, 0);
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
