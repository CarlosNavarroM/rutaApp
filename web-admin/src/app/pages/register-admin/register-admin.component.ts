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
  // Objeto para almacenar los datos del administrador a registrar
  admin: Usuario = {
    correo: '',
    perfil: 'Administrador'
  };

  // Mensajes de éxito y error para mostrar en la interfaz
  successMessage: string = '';
  errorMessage: string = '';
  // Indicador de carga para mostrar spinner o deshabilitar el formulario
  loading: boolean = false;

  // Inyecta el servicio de autenticación
  constructor(private authService: AuthService) {}

  // Método que se ejecuta al enviar el formulario de registro
  async onRegister(): Promise<void> {
    // Validación: el correo es obligatorio
    if (!this.admin.correo) {
      this.errorMessage = 'El correo es obligatorio.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      // Llama al servicio para registrar al administrador
      await this.authService.registerAdmin(this.admin);
      // Muestra mensaje de éxito si el registro fue exitoso
      this.successMessage = 'Administrador registrado exitosamente. Se ha enviado un correo para restablecer la contraseña.';
    } catch (error) {
      // Muestra mensaje de error si ocurre algún problema
      this.errorMessage = 'Error al registrar al administrador. Por favor, inténtalo de nuevo.';
    } finally {
      // Finaliza la carga
      this.loading = false;
    }
  }
}