import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { Drone, DroneImagem } from '../../../../core/models/drone/Drone';
import { ComparacaoService } from '../../../../core/services/ComparacaoService';
import { DroneService } from '../../../../core/services/DroneService';

type Criterio = 'maior' | 'menor';

interface CelulaComparacao {
  texto: string;
  melhor: boolean;
}

export interface LinhaComparacao {
  rotulo: string;
  destaque?: string;
  valores: CelulaComparacao[];
}

export interface GrupoComparacao {
  titulo: string;
  linhas: LinhaComparacao[];
}

/** Resultado da busca de um drone selecionado: null quando ele não está mais disponível. */
type Busca = { id: number; drone: Drone | null; falhou: boolean };

@Component({
  imports: [MatIconModule, RouterLink],
  selector: 'app-comparar',
  styleUrl: './comparar.css',
  templateUrl: './comparar.html',
})
export class Comparar implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly droneService = inject(DroneService);
  readonly comparacao = inject(ComparacaoService);

  private readonly cache = signal<ReadonlyMap<number, Drone>>(new Map());
  private readonly ids = computed(() => this.comparacao.itens().map((item) => item.id));
  private readonly ids$ = toObservable(this.ids);

  readonly erro = signal('');
  readonly aviso = signal('');
  readonly imagensComFalha = signal<ReadonlySet<number>>(new Set());

  /** Drones na ordem em que foram escolhidos, só os que já têm a ficha carregada. */
  readonly drones = computed(() => {
    const cache = this.cache();
    return this.ids()
      .map((id) => cache.get(id))
      .filter((drone): drone is Drone => !!drone);
  });

  /** Há drones escolhidos cuja ficha ainda não chegou. */
  readonly pendente = computed(() => !this.erro() && this.drones().length < this.ids().length);
  readonly podeAdicionar = computed(() => !this.comparacao.cheia());
  /** Coluna de rótulos + uma por drone + a vaga "adicionar" quando cabe mais um. */
  readonly totalColunas = computed(() => 1 + this.drones().length + (this.podeAdicionar() ? 1 : 0));

  readonly grupos = computed<GrupoComparacao[]>(() => {
    const drones = this.drones();
    if (drones.length === 0) {
      return [];
    }
    const sim = (valor: boolean | undefined) => (valor ? 'Sim' : 'Não');
    return [
      {
        titulo: 'Desempenho',
        linhas: [
          this.numerica(drones, 'Autonomia de voo', (d) => d.tempoVooPratico, (n) => `${this.numero(n)} min`, 'maior', 'maior'),
          this.numerica(drones, 'Alcance de transmissão', (d) => d.alcanceTransmissao, (n) => this.alcance(n), 'maior', 'maior'),
          this.numerica(drones, 'Velocidade máxima', (d) => d.velocidadeMaxima, (n) => `${this.numero(n)} km/h`, 'maior', 'maior'),
          this.numerica(drones, 'Altitude máxima', (d) => d.altitudeMaxima, (n) => `${this.numero(n)} m`, 'maior', 'maior'),
          this.numerica(drones, 'Peso de decolagem', (d) => d.pesoDecolagem, (n) => `${this.numero(n)} g`, 'menor', 'mais leve'),
        ],
      },
      {
        titulo: 'Câmera e conectividade',
        linhas: [
          this.texto(drones, 'Câmera', (d) => (d.possuiCamera ? d.camera?.resolucao || 'Sim' : 'Não')),
          this.texto(drones, 'Estabilização', (d) => (d.camera ? sim(d.camera.estabilizacao) : '—')),
          this.texto(drones, 'GPS', (d) => sim(d.possuiGPS)),
          this.texto(drones, 'Frequência Wi-Fi', (d) => d.frequenciaWifi || '—'),
        ],
      },
      {
        titulo: 'Controle e bateria',
        linhas: [
          this.texto(drones, 'Controle remoto', (d) => (d.comControleRemoto ? 'Incluído' : 'Não incluído')),
          this.texto(drones, 'Controle por aplicativo', (d) => sim(d.controladoPorAplicativo)),
          this.numerica(drones, 'Baterias inclusas', (d) => d.quantidadeBaterias, (n) => this.numero(n), 'maior', 'mais'),
          this.texto(drones, 'Duração da bateria', (d) => d.duracaoBateria || '—'),
          this.texto(drones, 'Motores', (d) => this.numero(d.quantidadeMotores)),
        ],
      },
    ];
  });

  readonly linhaPreco = computed(() =>
    this.numerica(this.drones(), 'Preço', (d) => d.preco, (n) => this.preco(n), 'menor', 'menor preço'),
  );

  private readonly formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  private readonly formatadorNumero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

  ngOnInit(): void {
    this.ids$
      .pipe(
        map((ids) => ids.filter((id) => !this.cache().has(id))),
        switchMap((faltantes) => {
          if (faltantes.length === 0) {
            return of([] as Busca[]);
          }
          this.erro.set('');
          return forkJoin(faltantes.map((id) => this.buscar(id)));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((buscas) => this.registrar(buscas));
  }

  tentarNovamente(): void {
    this.erro.set('');
    const faltantes = this.ids().filter((id) => !this.cache().has(id));
    forkJoin(faltantes.map((id) => this.buscar(id)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((buscas) => this.registrar(buscas));
  }

  remover(id: number): void {
    this.comparacao.remover(id);
  }

  limpar(): void {
    this.comparacao.limpar();
    this.aviso.set('');
  }

  imagemPrincipal(drone: Drone): DroneImagem | undefined {
    return drone.imagens?.find((imagem) => imagem.principal) ?? drone.imagens?.[0];
  }

  urlImagem(imagem: DroneImagem): string {
    return this.droneService.obterUrlImagem(imagem);
  }

  marcarImagemComFalha(id: number): void {
    this.imagensComFalha.update((ids) => new Set(ids).add(id));
  }

  preco(valor: number): string {
    return this.formatadorMoeda.format(valor);
  }

  private buscar(id: number): Observable<Busca> {
    return this.droneService.findByIdEcommerce(id).pipe(
      map((drone) => ({ id, drone, falhou: false })),
      catchError((erro: unknown) => {
        const status = (erro as { status?: number })?.status;
        // 404: o drone saiu do catálogo; qualquer outra falha pode ser temporária.
        return of({ id, drone: null, falhou: status !== 404 });
      }),
    );
  }

  private registrar(buscas: Busca[]): void {
    const cache = new Map(this.cache());
    buscas.forEach((busca) => busca.drone && cache.set(busca.id, busca.drone));
    this.cache.set(cache);

    const indisponiveis = buscas.filter((busca) => !busca.drone && !busca.falhou);
    if (indisponiveis.length) {
      indisponiveis.forEach((busca) => this.comparacao.remover(busca.id));
      this.aviso.set(
        indisponiveis.length === 1
          ? 'Um dos drones escolhidos não está mais no catálogo e saiu da comparação.'
          : 'Alguns drones escolhidos não estão mais no catálogo e saíram da comparação.',
      );
    }
    if (buscas.some((busca) => busca.falhou)) {
      this.erro.set('Não foi possível carregar todos os drones escolhidos.');
    }
  }

  private numerica(
    drones: Drone[],
    rotulo: string,
    valor: (drone: Drone) => number | undefined,
    formatar: (valor: number) => string,
    criterio: Criterio,
    destaque: string,
  ): LinhaComparacao {
    const numeros = drones.map(valor);
    const validos = numeros.filter((n): n is number => typeof n === 'number' && Number.isFinite(n));
    const melhor = validos.length > 1
      ? criterio === 'maior' ? Math.max(...validos) : Math.min(...validos)
      : undefined;
    const unico = validos.filter((n) => n === melhor).length === 1;
    return {
      rotulo,
      destaque,
      valores: numeros.map((n) => ({
        texto: typeof n === 'number' && Number.isFinite(n) ? formatar(n) : '—',
        melhor: unico && n === melhor,
      })),
    };
  }

  private texto(drones: Drone[], rotulo: string, valor: (drone: Drone) => string): LinhaComparacao {
    return { rotulo, valores: drones.map((drone) => ({ texto: valor(drone), melhor: false })) };
  }

  private numero(valor: number | undefined): string {
    return typeof valor === 'number' && Number.isFinite(valor) ? this.formatadorNumero.format(valor) : '—';
  }

  private alcance(metros: number): string {
    return metros >= 1000 ? `${this.numero(metros / 1000)} km` : `${this.numero(metros)} m`;
  }
}
