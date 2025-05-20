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
  conductor: Conductor = {
    nombre: '',
    correo: '',
    perfil: 'Conductor',
    rut: '',
    licencia: '',
    telefono: '',
    
  };

  successMessage: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(private readonly authService: AuthService) {}

  async onRegister(): Promise<void> {
    if (!this.conductor.nombre || !this.conductor.correo || !this.conductor.rut || !this.conductor.licencia) {
      this.errorMessage = 'Todos los campos son obligatorios.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.authService.registerConductor(this.conductor);
      this.successMessage = 'Conductor registrado exitosamente. Se ha enviado un correo para restablecer la contraseña.';
    } catch (error) {
      console.error('Error details:', error);
      this.errorMessage = 'Error al registrar al conductor. Por favor, inténtalo de nuevo.';
    } finally {
      this.loading = false;
    }
  }
}