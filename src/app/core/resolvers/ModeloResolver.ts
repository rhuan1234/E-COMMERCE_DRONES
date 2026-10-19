import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Modelo } from '../models/modelo/Modelo';
import { ModeloService } from '../services/ModeloService';

export const modeloResolver: ResolveFn<Modelo> = (route) => {
  return inject(ModeloService).findById(route.paramMap.get('id'));
};
