import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Conductor } from '../../models/models';

@Component({
  selector: 'app-register-driver',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-driver.component.html',
  styleUrls: ['./register-driver.component.scss']
})
export class RegisterDriverComponent {
  // Objeto conductor que almacena los datos del formulario
  conductor: Conductor = {
    nombre: '',
    correo: '',
    perfil: 'Conductor',
    rut: '',
    licencia: '',
    telefono: '',
  };

  // Mensajes de éxito y error para mostrar en la interfaz
  successMessage: string = '';
  errorMessage: string = '';
  // Indicador de carga para mostrar spinner o deshabilitar el botón
  loading: boolean = false;

  // Inyección del servicio de autenticación
  constructor(private readonly authService: AuthService) {}

  // Método que se ejecuta al enviar el formulario de registro
  async onRegister(): Promise<void> {
    // Validación de campos obligatorios
    if (!this.conductor.nombre || !this.conductor.correo || !this.conductor.rut || !this.conductor.licencia) {
      this.errorMessage = 'Todos los campos son obligatorios.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      // Llama al servicio para registrar al conductor
      await this.authService.registerConductor(this.conductor);
      this.successMessage = 'Conductor registrado exitosamente. Se ha enviado un correo para restablecer la contraseña.';
    } catch (error) {
      // Manejo de errores en caso de fallo en el registro
      console.error('Error details:', error);
      this.errorMessage = 'Error al registrar al conductor. Por favor, inténtalo de nuevo.';
    } finally {
      // Finaliza el estado de carga
      this.loading = false;
    }
  }
}