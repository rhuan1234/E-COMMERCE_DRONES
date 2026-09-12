import { Routes } from '@angular/router';
import { CameraForm } from './features/admin/components/camera-form/camera-form';
import { CameraList } from './features/admin/components/camera-list/camera-list';
import { cameraResolver } from './core/resolvers/CameraResolver';

export const routes: Routes = [
    {path: 'cameras', component: CameraList, title: 'Lista de Câmeras'},
];
