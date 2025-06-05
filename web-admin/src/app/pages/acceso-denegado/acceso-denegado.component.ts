import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
  constructor(private router: Router) {}

  volverAlLogin() {
    this.router.navigate(['/login']);
  }
}
