import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-driver',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-driver.component.html',
  styleUrls: ['./register-driver.component.scss']
})
export class RegisterDriverComponent {
  name: string = '';
  email: string = '';
  rut: string = '';
  successMessage: string = '';
  errorMessage: string = '';

  onRegister(): void {
    if (!this.name || !this.email || !this.rut) {
      this.errorMessage = 'Todos los campos son obligatorios.';
      return;
    }

    // Simulación de registro
    this.successMessage = 'Conductor registrado exitosamente. Se ha enviado un correo.';
    this.errorMessage = '';
  }
}