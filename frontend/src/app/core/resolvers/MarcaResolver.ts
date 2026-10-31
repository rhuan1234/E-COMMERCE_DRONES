import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Marca } from '../models/marca/Marca';
import { MarcaService } from '../services/MarcaService';

export const marcaResolver: ResolveFn<Marca> = (route) => {
  return inject(MarcaService).findById(route.paramMap.get('id'));
};
