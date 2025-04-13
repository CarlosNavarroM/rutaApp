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
    path: '**',
    redirectTo: 'login', // Redirige rutas no encontradas al login
  },
];