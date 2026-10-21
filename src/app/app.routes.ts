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
import { AdmnistradorList } from './features/admin/components/admnistrador-list/admnistrador-list';
import { AdministradorForm } from './features/admin/components/administrador-form/administrador-form';
import { PromocaoList } from './features/admin/components/promocao-list/promocao-list';
import { PromocaoForm } from './features/admin/components/promocao-form/promocao-form';
import { PerfilPage } from './features/admin/components/perfil-page/perfil-page';
import { EnderecosPage } from './features/admin/components/enderecos-page/enderecos-page';
import { AlterarSenhaPage } from './features/admin/components/alterar-senha-page/alterar-senha-page';
import { CameraForm } from './features/admin/components/camera-form/camera-form';
import { cameraResolver } from './core/resolvers/CameraResolver';
import { EcommerceLayout } from './features/ecommerce/layout/ecommerce-layout/ecommerce-layout';
import { Home } from './features/ecommerce/components/home/home';


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
      {path: 'drones/filtro/modelo/:modelo', component:DroneList, title:"Drones por modelo"},

      // Câmeras
      { path: 'cameras', component: CameraList, title: 'Lista de Câmeras' },
      { path: 'cameras/new', component: CameraForm, title: 'Nova Câmera' },
      { path: 'cameras/:id/edit', component: CameraForm, title: 'Editar Câmera', resolve: { camera: cameraResolver } },
      { path: 'cameras/filtro/modelo/:modelo', component: CameraList, title: 'Câmeras por modelo' },

      // Fornecedores
      { path: 'fornecedores', component: FornecedorList, title: 'Lista de Fornecedores' },
      { path: 'fornecedores/filtro/nome/:nome', component: FornecedorList, title: 'Fornecedores por nome' },
      { path: 'fornecedores/new', component: FornecedorForm, title: 'Novo Fornecedor' },
      { path: 'fornecedores/:id/edit', component: FornecedorForm, title: 'Editar Fornecedor', resolve: { fornecedor: fornecedorResolver } },

      {path: 'administradores', component: AdmnistradorList, title: 'Lista de Administradores'},
      {path: 'administradores/filtro/login/:login', component: AdmnistradorList, title: 'Administradores por login'},
      {path: 'administradores/new', component: AdministradorForm, title: 'Novo Administrador'},

      // Promoções
      { path: 'promocoes', component: PromocaoList, title: 'Lista de Promoções' },
      { path: 'promocoes/filtro/nome/:nome', component: PromocaoList, title: 'Promoções por nome' },
      { path: 'promocoes/new', component: PromocaoForm, title: 'Nova Promoção' },
      { path: 'promocoes/:id/edit', component: PromocaoForm, title: 'Editar Promoção' },

      //Perfil
      {path: 'perfil', component: PerfilPage, title: 'Perfil do Usuário'},

      //Alterar Senha
      {path: 'perfil/alterar-senha', component: AlterarSenhaPage, title: 'Alterar Senha'},

      //Endereco
      {path: 'enderecos', component: EnderecosPage, title: 'Lista de Endereços'},
    ]
  },
  // Rotas do ecommerce
  {
    path: '',
    component: EcommerceLayout,
    children: [
        //Pagina principal ecommerce
        {path: 'home', component: Home, title: 'Página Inicial'},
    ]
  },

  // Fallback
  { path: '**', redirectTo: 'drones' }
];