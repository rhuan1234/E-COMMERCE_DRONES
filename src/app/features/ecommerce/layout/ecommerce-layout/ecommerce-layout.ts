import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterOutlet } from '@angular/router';

interface FilterGroup {
  title: string;
  options: string[];
}

@Component({
  imports: [FormsModule, MatIconModule, RouterLink, RouterOutlet],
  selector: 'app-ecommerce-layout',
  styleUrl: './ecommerce-layout.css',
  templateUrl: './ecommerce-layout.html',
})
export class EcommerceLayout {
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
  precoMinimo = '';
  precoMaximo = '';

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
