import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/models';

@Component({
  selector: 'app-register-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-admin.component.html',
  styleUrls: ['./register-admin.component.scss']
})
export class RegisterAdminComponent {
  admin: Usuario = {
    correo: '',
    perfil: 'Administrador'
  };

  successMessage: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(private authService: AuthService) {}

  async onRegister(): Promise<void> {
    if (!this.admin.correo) {
      this.errorMessage = 'El correo es obligatorio.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.authService.registerAdmin(this.admin);
      this.successMessage = 'Administrador registrado exitosamente. Se ha enviado un correo para restablecer la contraseña.';
    } catch (error) {
      this.errorMessage = 'Error al registrar al administrador. Por favor, inténtalo de nuevo.';
    } finally {
      this.loading = false;
    }
  }
}