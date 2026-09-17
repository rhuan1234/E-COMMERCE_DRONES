import { Routes } from '@angular/router';
import { CameraList } from './features/admin/components/camera-list/camera-list';
import { FornecedorList } from './features/admin/components/fornecedor-list/fornecedor-list';
import { FornecedorForm } from './features/admin/components/fornecedor-form/fornecedor-form';
import { fornecedorResolver } from './core/resolvers/FornecedorResolver';
import { authGuard } from './core/services/auth/AuthGuard';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { DroneForm } from './features/admin/components/drone-form/drone-form';
import { DroneList } from './features/admin/components/drone-list/drone-list';
import { droneResolver } from './core/resolvers/DroneResolver';

export const routes: Routes = [
    {path: 'cameras', 
        component: CameraList, 
        title: 'Lista de Câmeras',
        canActivate: [authGuard]},

    {path: 'fornecedores', 
        component: FornecedorList, 
        title: 'Lista de Fornecedores',
        canActivate: [authGuard]},

    {path: 'fornecedores/new', 
        component: FornecedorForm, 
        title: 'Novo Fornecedor',
        canActivate: [authGuard]},

    {path: 'fornecedores/:id/edit', 
        component: FornecedorForm, 
        title: 'Editar Fornecedor',
        resolve: { fornecedor: fornecedorResolver },
        canActivate: [authGuard]
    },

   {
    path: 'login',
    component: Login,
    title: 'Login'
   },
   
   {
    path: 'register',
    component: Register,
    title: 'cadastro'
   },

   {
    path: 'drones',
    component: DroneList,
    title: "Drones",
    canActivate: [authGuard]
   },

   {
    path: 'drones/new',
    component: DroneForm,
    title: 'Novo Drone',
    canActivate: [authGuard]
   },
   {
    path: 'drones/:id/edit',
    component: DroneForm,
    title: 'Editar Drone',
    resolve: {drone: droneResolver},
    canActivate: [authGuard]
   }
];
