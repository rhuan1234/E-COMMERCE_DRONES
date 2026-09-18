import { Routes } from '@angular/router';
import { authGuard } from './core/services/auth/AuthGuard';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { CameraList } from './features/admin/components/camera-list/camera-list';
import { FornecedorList } from './features/admin/components/fornecedor-list/fornecedor-list';
import { FornecedorForm } from './features/admin/components/fornecedor-form/fornecedor-form';
import { fornecedorResolver } from './core/resolvers/FornecedorResolver';
import { DroneForm } from './features/admin/components/drone-form/drone-form';
import { DroneList } from './features/admin/components/drone-list/drone-list';
import { droneResolver } from './core/resolvers/DroneResolver';
import { AdminLayoutComponent } from './features/admin/layout/admin-layout/admin-layout';

export const routes: Routes = [
  // Rotas auth
  { path: 'login', component: Login, title: 'Login' },
  { path: 'register', component: Register, title: 'Cadastro' },

  // Rotas administrativas 
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'drones', pathMatch: 'full' },

      // Drones
      { path: 'drones', component: DroneList, title: 'Drones' },
      { path: 'drones/new', component: DroneForm, title: 'Novo Drone' },
      { path: 'drones/:id/edit', component: DroneForm, title: 'Editar Drone', resolve: { drone: droneResolver } },

      // Câmeras
      { path: 'cameras', component: CameraList, title: 'Lista de Câmeras' },

      // Fornecedores
      { path: 'fornecedores', component: FornecedorList, title: 'Lista de Fornecedores' },
      { path: 'fornecedores/new', component: FornecedorForm, title: 'Novo Fornecedor' },
      { path: 'fornecedores/:id/edit', component: FornecedorForm, title: 'Editar Fornecedor', resolve: { fornecedor: fornecedorResolver } },
    ]
  },

  // Fallback
  { path: '**', redirectTo: 'drones' }
];