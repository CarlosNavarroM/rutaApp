import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterDriverComponent } from './pages/register-driver/register-driver.component';
import { RegisterAdminComponent } from './pages/register-admin/register-admin.component';
import { AddRouteComponent } from './pages/add-route/add-route.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'acceso-denegado', loadComponent: () => import('./pages/acceso-denegado/acceso-denegado.component').then(m => m.AccesoDenegadoComponent) },
  { path: 'register-driver', component: RegisterDriverComponent, canActivate: [authGuard] },
  { path: 'register-admin', component: RegisterAdminComponent, canActivate: [authGuard] },
  { path: 'add-route', component: AddRouteComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
