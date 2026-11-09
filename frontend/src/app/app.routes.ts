import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/services/auth/AuthGuard';
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
import { Landing } from './features/ecommerce/components/landing/landing';
import { Favoritos } from './features/ecommerce/components/favoritos/favoritos';
import { DroneInfo } from './features/ecommerce/components/drone-info/drone-info';
import { Comparar } from './features/ecommerce/components/comparar/comparar';
import { MinhaConta } from './features/ecommerce/components/minha-conta/minha-conta';
import { Carrinho } from './features/ecommerce/components/carrinho/carrinho';
import { ModeloList } from './features/admin/components/modelo-list/modelo-list';
import { ModeloForm } from './features/admin/components/modelo-form/modelo-form';
import { MarcaList } from './features/admin/components/marca-list/marca-list';
import { MarcaForm } from './features/admin/components/marca-form/marca-form';
import { modeloResolver } from './core/resolvers/ModeloResolver';
import { marcaResolver } from './core/resolvers/MarcaResolver';


export const routes: Routes = [
  // Rotas auth
  { path: 'login', component: Login, title: 'Login' },
  { path: 'register', component: Register, title: 'Cadastro' },

  // Loja (vitrine e área do cliente)
  {
    path: '',
    component: EcommerceLayout,
    children: [
        // Página de apresentação (raiz do sistema)
        {path: '', pathMatch: 'full', component: Landing, title: 'Skyline Drones'},
        // Catálogo da loja
        {path: 'home', component: Home, title: 'Catálogo de drones'},
        {path: 'comparar', component: Comparar, title: 'Comparar drones'},
        {path: 'favoritos', component: Favoritos, title: 'Meus Favoritos'},
        {path: 'carrinho', component: Carrinho, title: 'Carrinho de compras'},
        {path: 'drone-info/:id', component: DroneInfo, title: 'Detalhes do Drone'},

        // Minha conta: dados pessoais, endereços e senha de qualquer usuário autenticado
        {
          path: 'minha-conta',
          component: MinhaConta,
          canActivate: [authGuard],
          children: [
            {path: '', redirectTo: 'dados', pathMatch: 'full'},
            {path: 'dados', component: PerfilPage, title: 'Meus dados'},
            {path: 'enderecos', component: EnderecosPage, title: 'Meus endereços'},
            {path: 'seguranca', component: AlterarSenhaPage, title: 'Segurança da conta'},
          ]
        },
    ]
  },

  // Endereços antigos da área do usuário
  { path: 'perfil/alterar-senha', redirectTo: 'minha-conta/seguranca' },
  { path: 'perfil', redirectTo: 'minha-conta/dados' },
  { path: 'enderecos', redirectTo: 'minha-conta/enderecos' },
  // Telas administrativas que antes ficavam na raiz
  ...['drones', 'marcas', 'modelos', 'cameras', 'fornecedores', 'administradores', 'promocoes']
    .map((secao) => ({ path: secao, redirectTo: `admin/${secao}` })),

  // Painel administrativo (somente perfil ADMIN)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'drones', pathMatch: 'full' },

      // Drones
      { path: 'drones', component: DroneList, title: 'Drones' },
      { path: 'drones/new', component: DroneForm, title: 'Novo Drone' },
      { path: 'drones/:id/edit', component: DroneForm, title: 'Editar Drone', resolve: { drone: droneResolver } },

      // Marcas
      { path: 'marcas', component: MarcaList, title: 'Lista de Marcas' },
      { path: 'marcas/new', component: MarcaForm, title: 'Nova Marca' },
      { path: 'marcas/:id/edit', component: MarcaForm, title: 'Editar Marca', resolve: { marca: marcaResolver } },
      { path: 'marcas/filtro/nome/:nome', component: MarcaList, title: 'Marcas por nome' },

      // Modelos
      { path: 'modelos', component: ModeloList, title: 'Lista de Modelos' },
      { path: 'modelos/new', component: ModeloForm, title: 'Novo Modelo' },
      { path: 'modelos/:id/edit', component: ModeloForm, title: 'Editar Modelo', resolve: { modelo: modeloResolver } },
      { path: 'modelos/filtro/nome/:nome', component: ModeloList, title: 'Modelos por nome' },

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

    ]
  },
  // Fallback
  { path: '**', redirectTo: 'home' }
];