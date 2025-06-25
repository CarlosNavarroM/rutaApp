import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  // Campos para el formulario de login
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  // Variables para recuperación de contraseña
  showForgotPasswordModal: boolean = false; // Controla la visibilidad del modal
  forgotEmail: string = ''; // Email para recuperación
  forgotPasswordMessage: string = ''; // Mensaje de estado para recuperación

  constructor(
    private readonly router: Router, // Para navegación
    private readonly authService: AuthService // Servicio de autenticación
  ) {}

  // Método para iniciar sesión
  async onLogin(): Promise<void> {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, ingresa correo y contraseña';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.login(this.email, this.password); // Llama al servicio de login
      this.router.navigate(['/add-route']); // Redirige al usuario si el login es exitoso
    } catch (error) {
      console.error('Login error:', error);
      this.errorMessage = 'Credenciales inválidas'; // Muestra mensaje de error
    } finally {
      this.loading = false;
    }
  }

  // Abre el modal de recuperación de contraseña
  openForgotPasswordModal(): void {
    this.forgotPasswordMessage = '';
    this.forgotEmail = '';
    this.showForgotPasswordModal = true;
  }

  // Cierra el modal de recuperación de contraseña
  closeForgotPasswordModal(): void {
    this.showForgotPasswordModal = false;
  }

  // Envía el correo de recuperación de contraseña
  async sendPasswordReset(): Promise<void> {
    if (!this.forgotEmail) {
      this.forgotPasswordMessage = 'Por favor, ingresa tu correo.';
      return;
    }

    try {
      await this.authService.resetPassword(this.forgotEmail); // Llama al servicio de recuperación
      this.forgotPasswordMessage = 'Se ha enviado un enlace de recuperación a tu correo.';
    } catch (error) {
      console.error('Error al enviar el correo de recuperación:', error);
      this.forgotPasswordMessage = 'No se pudo enviar el correo. Verifica el email.';
    }
  }
}
