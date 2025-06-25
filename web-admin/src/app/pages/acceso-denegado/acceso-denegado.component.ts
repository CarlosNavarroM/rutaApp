import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Componente de Angular que muestra una página de "Acceso Denegado".
 * 
 * Este componente se utiliza para informar al usuario que no tiene permisos para acceder
 * a la página solicitada. Incluye un botón que permite redirigir al usuario a la página de login.
 *
 * @example
 * <app-acceso-denegado></app-acceso-denegado>
 *
 * @remarks
 * - Utiliza el enrutador de Angular para la navegación.
 * - Es un componente standalone.
 *
 * @class
 */
@Component({
  selector: 'app-acceso-denegado',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="acceso-denegado">
      <h1>Acceso Denegado</h1>
      <p>No tienes permisos para acceder a esta página.</p>
      <button (click)="volverAlLogin()">Volver al Login</button>
    </div>
  `,
  styles: [`
    .acceso-denegado {
      text-align: center;
      margin-top: 100px;
      color: #c00;
    }

    button {
      margin-top: 20px;
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
    }
  `]
})
export class AccesoDenegadoComponent {
  constructor(private readonly router: Router) {}

  volverAlLogin() {
    this.router.navigate(['/login']);
  }
}
