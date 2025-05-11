import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    redirectTo: 'login', // Cambia la redirección inicial al login
    pathMatch: 'full',
  },
 
  {
    path: 'resumen',
    loadComponent: () => import('./resumen/resumen.page').then( m => m.ResumenPage)
  },
  {
    path: 'recuperar',
    loadComponent: () => import('./pages/recuperar/recuperar.page').then( m => m.RecuperarPage)
  },

];
