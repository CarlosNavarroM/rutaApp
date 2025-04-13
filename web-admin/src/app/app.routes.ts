import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterDriverComponent } from './pages/register-driver/register-driver.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register-driver', component: RegisterDriverComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];