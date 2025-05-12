import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./home/home.page').then(m => m.HomePage)
  },
  {
    path: 'resumen',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./resumen/resumen.page').then(m => m.ResumenPage)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'recuperar',
    loadComponent: () =>
      import('./pages/recuperar/recuperar.page').then(m => m.RecuperarPage)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];