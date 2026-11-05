import { NgTemplateOutlet } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Drone, DroneImagem } from '../../../../core/models/drone/Drone';
import { TIPOS_DE_VOO } from '../../../../core/models/drone/TipoDeVoo';
import { AuthService } from '../../../../core/services/auth/AuthService';
import { DroneService } from '../../../../core/services/DroneService';

/**
 * Página de apresentação da loja (rota raiz). Não lista o catálogo:
 * mostra apenas um drone em destaque e leva o visitante para `/home`.
 */
@Component({
  imports: [MatIconModule, NgTemplateOutlet, RouterLink],
  selector: 'app-landing',
  styleUrl: './landing.css',
  templateUrl: './landing.html',
})
export class Landing implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly droneService = inject(DroneService);
  private readonly authService = inject(AuthService);

  readonly tiposDeVoo = TIPOS_DE_VOO;
  readonly destaque = signal<Drone | null>(null);
  readonly carregandoDestaque = signal(true);
  readonly imagemComFalha = signal(false);

  private readonly formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  private readonly formatadorNumero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

  ngOnInit(): void {
    this.droneService
      .findAllEcommerce(0, 1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resposta) => {
          this.destaque.set(resposta.items?.[0] ?? null);
          this.carregandoDestaque.set(false);
        },
        error: (error: unknown) => {
          // A apresentação continua útil sem o destaque: só a ficha deixa de aparecer.
          console.error('Erro ao carregar o drone em destaque:', error);
          this.carregandoDestaque.set(false);
        },
      });
  }

  get usuarioAutenticado(): boolean {
    return this.authService.isAuthenticated();
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

  formatarNumero(valor: number | undefined): string {
    if (typeof valor !== 'number' || !Number.isFinite(valor)) {
      return '—';
    }
    return this.formatadorNumero.format(valor);
  }

  formatarAlcance(metros: number | undefined): string {
    if (typeof metros !== 'number' || !Number.isFinite(metros)) {
      return '—';
    }
    return metros >= 1000
      ? `${this.formatarNumero(metros / 1000)} km`
      : `${this.formatarNumero(metros)} m`;
  }
}
