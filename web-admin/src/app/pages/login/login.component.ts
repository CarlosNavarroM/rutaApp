import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Importa FormsModule como dependencia standalone
import { CommonModule } from '@angular/common'; // Importa CommonModule para directivas básicas como *ngIf y *ngFor

@Component({
  selector: 'app-login',
  standalone: true, // Marca el componente como standalone
  imports: [CommonModule, FormsModule], // Importa los módulos necesarios
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
    if (this.email === 'test@example.com' && this.password === 'password') {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Credenciales inválidas';
    }
    this.loading = false;
  }
}