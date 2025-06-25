import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterDriverComponent } from './pages/register-driver/register-driver.component';
import { RegisterAdminComponent } from './pages/register-admin/register-admin.component';
import { AddRouteComponent } from './pages/add-route/add-route.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component'

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register-driver', component: RegisterDriverComponent },
  {path: 'register-admin',component:RegisterAdminComponent},
  {path: 'add-route', component: AddRouteComponent},
  {path: 'dashboard',component: DashboardComponent},
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];