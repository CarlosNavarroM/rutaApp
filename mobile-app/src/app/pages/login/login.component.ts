import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(private readonly router: Router) {}

  onLogin(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, ingresa correo y contraseña';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Simulación de autenticación
    setTimeout(() => {
      if (this.email === 'driver@example.com' && this.password === 'password') {
        this.router.navigate(['/dashboard']); // Redirige al dashboard
      } else {
        this.errorMessage = 'Credenciales inválidas';
      }
      this.loading = false;
    }, 1500);
  }
}