import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { Drone, DroneImagem } from '../../../../core/models/drone/Drone';
import { PagedResponse } from '../../../../core/models/PagedResponse';
import { AuthService } from '../../../../core/services/auth/AuthService';
import { DroneService } from '../../../../core/services/DroneService';
import { FavoritoService } from '../../../../core/services/FavoritoService';

@Component({
  imports: [MatIconModule, RouterLink],
  selector: 'app-favoritos',
  styleUrl: './favoritos.css',
  templateUrl: './favoritos.html',
})
export class Favoritos implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly pageSize = 12;
  private readonly formatadorMoeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  readonly drones = signal<Drone[]>([]);
  readonly pagina = signal(0);
  readonly totalPaginas = signal(0);
  readonly carregando = signal(false);
  readonly erro = signal('');
  readonly mensagemSucesso = signal('');
  readonly dronesEmRemocao = signal<ReadonlySet<number>>(new Set());

  constructor(
    private readonly favoritoService: FavoritoService,
    private readonly droneService: DroneService,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      void this.router.navigate(['/login'], { queryParams: { returnUrl: '/favoritos' } });
      return;
    }

    this.carregarPagina(0);
  }

  carregarPagina(pagina: number): void {
    this.carregando.set(true);
    this.erro.set('');
    this.favoritoService.listar(pagina, this.pageSize)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resposta: PagedResponse<Drone>) => {
          this.drones.set(resposta.items);
          this.pagina.set(resposta.page);
          this.totalPaginas.set(resposta.totalPages);
          this.carregando.set(false);
        },
        error: (error: unknown) => {
          console.error('Erro ao carregar favoritos:', error);
          this.erro.set('Não foi possível carregar seus favoritos. Tente novamente.');
          this.carregando.set(false);
        },
      });
  }

  removerFavorito(drone: Drone): void {
    if (this.dronesEmRemocao().has(drone.id)) {
      return;
    }

    this.atualizarEmRemocao(drone.id, true);
    this.erro.set('');
    this.mensagemSucesso.set('');
    this.favoritoService.remover(drone.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const proximaPagina = this.drones().length === 1 && this.pagina() > 0
            ? this.pagina() - 1
            : this.pagina();
          this.mensagemSucesso.set(`${drone.nome} foi removido dos favoritos.`);
          this.atualizarEmRemocao(drone.id, false);
          this.carregarPagina(proximaPagina);
        },
        error: (error: unknown) => {
          console.error('Erro ao remover favorito:', error);
          this.erro.set('Não foi possível remover este drone dos favoritos. Tente novamente.');
          this.atualizarEmRemocao(drone.id, false);
        },
      });
  }

  imagemPrincipal(drone: Drone): DroneImagem | undefined {
    return drone.imagens?.find((imagem) => imagem.principal);
  }

  obterUrlImagem(imagem: DroneImagem): string {
    return this.droneService.obterUrlImagem(imagem);
  }

  formatarPreco(valor: number): string {
    return this.formatadorMoeda.format(valor);
  }

  private atualizarEmRemocao(droneId: number, removendo: boolean): void {
    const ids = new Set(this.dronesEmRemocao());
    if (removendo) {
      ids.add(droneId);
    } else {
      ids.delete(droneId);
    }
    this.dronesEmRemocao.set(ids);
  }
}
