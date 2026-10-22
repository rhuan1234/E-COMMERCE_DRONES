import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Drone, DroneImagem } from '../../../../core/models/drone/Drone';
import { DroneService } from '../../../../core/services/DroneService';

@Component({
  imports: [MatIconModule],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  readonly dronesPorPagina = 12;
  drones: Drone[] = [];
  carregandoDrones = true;
  mensagemErroDrones = '';
  readonly imagensComFalha = new Set<number>();
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
}
