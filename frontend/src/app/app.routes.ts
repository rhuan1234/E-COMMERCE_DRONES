import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/services/auth/AuthGuard';
import { fornecedorResolver } from './core/resolvers/FornecedorResolver';
import { droneResolver } from './core/resolvers/DroneResolver';
import { cameraResolver } from './core/resolvers/CameraResolver';
import { modeloResolver } from './core/resolvers/ModeloResolver';
import { marcaResolver } from './core/resolvers/MarcaResolver';
import { EcommerceLayout } from './features/ecommerce/layout/ecommerce-layout/ecommerce-layout';
import { Home } from './features/ecommerce/components/home/home';

export const routes: Routes = [
  // Rotas auth (sob demanda)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
    title: 'Login',
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
    title: 'Cadastro',
  },

  // Loja (vitrine e área do cliente)
  {
    path: '',
    component: EcommerceLayout,
    children: [
      // Página de apresentação (raiz do sistema)
      {
        path: '',
        pathMatch: 'full',
        // Carregada sob demanda: a apresentação animada não pesa no bundle inicial da loja
        loadComponent: () => import('./features/ecommerce/components/landing/landing').then((m) => m.Landing),
        title: 'Skyline Drones',
      },
      // Catálogo da loja
      { path: 'home', component: Home, title: 'Catálogo de drones' },
      {
        path: 'comparar',
        loadComponent: () => import('./features/ecommerce/components/comparar/comparar').then((m) => m.Comparar),
        title: 'Comparar drones',
      },
      {
        path: 'favoritos',
        loadComponent: () => import('./features/ecommerce/components/favoritos/favoritos').then((m) => m.Favoritos),
        title: 'Meus Favoritos',
      },
      {
        path: 'carrinho',
        loadComponent: () => import('./features/ecommerce/components/carrinho/carrinho').then((m) => m.Carrinho),
        title: 'Carrinho de compras',
      },
      {
        path: 'drone-info/:id',
        loadComponent: () => import('./features/ecommerce/components/drone-info/drone-info').then((m) => m.DroneInfo),
        title: 'Detalhes do Drone',
      },

      // Minha conta: dados pessoais, endereços e senha de qualquer usuário autenticado
      {
        path: 'minha-conta',
        loadComponent: () => import('./features/ecommerce/components/minha-conta/minha-conta').then((m) => m.MinhaConta),
        canActivate: [authGuard],
        children: [
          { path: '', redirectTo: 'dados', pathMatch: 'full' },
          {
            path: 'dados',
            loadComponent: () => import('./features/admin/components/perfil-page/perfil-page').then((m) => m.PerfilPage),
            title: 'Meus dados',
          },
          {
            path: 'enderecos',
            loadComponent: () => import('./features/admin/components/enderecos-page/enderecos-page').then((m) => m.EnderecosPage),
            title: 'Meus endereços',
          },
          {
            path: 'seguranca',
            loadComponent: () =>
              import('./features/admin/components/alterar-senha-page/alterar-senha-page').then((m) => m.AlterarSenhaPage),
            title: 'Segurança da conta',
          },
        ],
      },
    ],
  },

  // Endereços antigos da área do usuário
  { path: 'perfil/alterar-senha', redirectTo: 'minha-conta/seguranca' },
  { path: 'perfil', redirectTo: 'minha-conta/dados' },
  { path: 'enderecos', redirectTo: 'minha-conta/enderecos' },
  // Telas administrativas que antes ficavam na raiz
  ...['drones', 'marcas', 'modelos', 'cameras', 'fornecedores', 'administradores', 'promocoes'].map((secao) => ({
    path: secao,
    redirectTo: `admin/${secao}`,
  })),

  // Painel administrativo (somente perfil ADMIN, carregado sob demanda para não pesar na loja)
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/layout/admin-layout/admin-layout').then((m) => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'drones', pathMatch: 'full' },

      // Drones
      {
        path: 'drones',
        loadComponent: () => import('./features/admin/components/drone-list/drone-list').then((m) => m.DroneList),
        title: 'Drones',
      },
      {
        path: 'drones/new',
        loadComponent: () => import('./features/admin/components/drone-form/drone-form').then((m) => m.DroneForm),
        title: 'Novo Drone',
      },
      {
        path: 'drones/:id/edit',
        loadComponent: () => import('./features/admin/components/drone-form/drone-form').then((m) => m.DroneForm),
        title: 'Editar Drone',
        resolve: { drone: droneResolver },
      },

      // Marcas
      {
        path: 'marcas',
        loadComponent: () => import('./features/admin/components/marca-list/marca-list').then((m) => m.MarcaList),
        title: 'Lista de Marcas',
      },
      {
        path: 'marcas/new',
        loadComponent: () => import('./features/admin/components/marca-form/marca-form').then((m) => m.MarcaForm),
        title: 'Nova Marca',
      },
      {
        path: 'marcas/:id/edit',
        loadComponent: () => import('./features/admin/components/marca-form/marca-form').then((m) => m.MarcaForm),
        title: 'Editar Marca',
        resolve: { marca: marcaResolver },
      },
      {
        path: 'marcas/filtro/nome/:nome',
        loadComponent: () => import('./features/admin/components/marca-list/marca-list').then((m) => m.MarcaList),
        title: 'Marcas por nome',
      },

      // Modelos
      {
        path: 'modelos',
        loadComponent: () => import('./features/admin/components/modelo-list/modelo-list').then((m) => m.ModeloList),
        title: 'Lista de Modelos',
      },
      {
        path: 'modelos/new',
        loadComponent: () => import('./features/admin/components/modelo-form/modelo-form').then((m) => m.ModeloForm),
        title: 'Novo Modelo',
      },
      {
        path: 'modelos/:id/edit',
        loadComponent: () => import('./features/admin/components/modelo-form/modelo-form').then((m) => m.ModeloForm),
        title: 'Editar Modelo',
        resolve: { modelo: modeloResolver },
      },
      {
        path: 'modelos/filtro/nome/:nome',
        loadComponent: () => import('./features/admin/components/modelo-list/modelo-list').then((m) => m.ModeloList),
        title: 'Modelos por nome',
      },

      // Câmeras
      {
        path: 'cameras',
        loadComponent: () => import('./features/admin/components/camera-list/camera-list').then((m) => m.CameraList),
        title: 'Lista de Câmeras',
      },
      {
        path: 'cameras/new',
        loadComponent: () => import('./features/admin/components/camera-form/camera-form').then((m) => m.CameraForm),
        title: 'Nova Câmera',
      },
      {
        path: 'cameras/:id/edit',
        loadComponent: () => import('./features/admin/components/camera-form/camera-form').then((m) => m.CameraForm),
        title: 'Editar Câmera',
        resolve: { camera: cameraResolver },
      },
      {
        path: 'cameras/filtro/modelo/:modelo',
        loadComponent: () => import('./features/admin/components/camera-list/camera-list').then((m) => m.CameraList),
        title: 'Câmeras por modelo',
      },

      // Fornecedores
      {
        path: 'fornecedores',
        loadComponent: () =>
          import('./features/admin/components/fornecedor-list/fornecedor-list').then((m) => m.FornecedorList),
        title: 'Lista de Fornecedores',
      },
      {
        path: 'fornecedores/filtro/nome/:nome',
        loadComponent: () =>
          import('./features/admin/components/fornecedor-list/fornecedor-list').then((m) => m.FornecedorList),
        title: 'Fornecedores por nome',
      },
      {
        path: 'fornecedores/new',
        loadComponent: () =>
          import('./features/admin/components/fornecedor-form/fornecedor-form').then((m) => m.FornecedorForm),
        title: 'Novo Fornecedor',
      },
      {
        path: 'fornecedores/:id/edit',
        loadComponent: () =>
          import('./features/admin/components/fornecedor-form/fornecedor-form').then((m) => m.FornecedorForm),
        title: 'Editar Fornecedor',
        resolve: { fornecedor: fornecedorResolver },
      },

      // Administradores
      {
        path: 'administradores',
        loadComponent: () =>
          import('./features/admin/components/admnistrador-list/admnistrador-list').then((m) => m.AdmnistradorList),
        title: 'Lista de Administradores',
      },
      {
        path: 'administradores/filtro/login/:login',
        loadComponent: () =>
          import('./features/admin/components/admnistrador-list/admnistrador-list').then((m) => m.AdmnistradorList),
        title: 'Administradores por login',
      },
      {
        path: 'administradores/new',
        loadComponent: () =>
          import('./features/admin/components/administrador-form/administrador-form').then((m) => m.AdministradorForm),
        title: 'Novo Administrador',
      },

      // Promoções
      {
        path: 'promocoes',
        loadComponent: () => import('./features/admin/components/promocao-list/promocao-list').then((m) => m.PromocaoList),
        title: 'Lista de Promoções',
      },
      {
        path: 'promocoes/filtro/nome/:nome',
        loadComponent: () => import('./features/admin/components/promocao-list/promocao-list').then((m) => m.PromocaoList),
        title: 'Promoções por nome',
      },
      {
        path: 'promocoes/new',
        loadComponent: () => import('./features/admin/components/promocao-form/promocao-form').then((m) => m.PromocaoForm),
        title: 'Nova Promoção',
      },
      {
        path: 'promocoes/:id/edit',
        loadComponent: () => import('./features/admin/components/promocao-form/promocao-form').then((m) => m.PromocaoForm),
        title: 'Editar Promoção',
      },
    ],
  },
  // Fallback
  { path: '**', redirectTo: 'home' },
];
