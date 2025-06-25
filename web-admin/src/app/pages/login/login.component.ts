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
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  // Variables para recuperación de contraseña
  showForgotPasswordModal: boolean = false;
  forgotEmail: string = '';
  forgotPasswordMessage: string = '';

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  async onLogin(): Promise<void> {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, ingresa correo y contraseña';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/add-route']);
    } catch (error) {
      console.error('Login error:', error);
      this.errorMessage = 'Credenciales inválidas';
    } finally {
      this.loading = false;
    }
  }

  openForgotPasswordModal(): void {
    this.forgotPasswordMessage = '';
    this.forgotEmail = '';
    this.showForgotPasswordModal = true;
  }

  closeForgotPasswordModal(): void {
    this.showForgotPasswordModal = false;
  }

  async sendPasswordReset(): Promise<void> {
    if (!this.forgotEmail) {
      this.forgotPasswordMessage = 'Por favor, ingresa tu correo.';
      return;
    }

    try {
      await this.authService.resetPassword(this.forgotEmail);
      this.forgotPasswordMessage = 'Se ha enviado un enlace de recuperación a tu correo.';
    } catch (error) {
      console.error('Error al enviar el correo de recuperación:', error);
      this.forgotPasswordMessage = 'No se pudo enviar el correo. Verifica el email.';
    }
  }
}
