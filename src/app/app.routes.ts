import { Routes } from '@angular/router';
import { CameraList } from './features/admin/components/camera-list/camera-list';
import { FornecedorList } from './features/admin/components/fornecedor-list/fornecedor-list';
import { FornecedorForm } from './features/admin/components/fornecedor-form/fornecedor-form';
import { fornecedorResolver } from './core/resolvers/FornecedorResolver';

export const routes: Routes = [
    {path: 'cameras', component: CameraList, title: 'Lista de Câmeras'},
    {path: 'fornecedores', component: FornecedorList, title: 'Lista de Fornecedores'},
    {path: 'fornecedores/new', component: FornecedorForm, title: 'Novo Fornecedor'},
    {path: 'fornecedores/:id/edit', component: FornecedorForm, title: 'Editar Fornecedor',
        resolve: { fornecedor: fornecedorResolver }
    }
];
