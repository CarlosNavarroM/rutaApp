import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importa CommonModule para usar directivas comunes de Angular
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule], // Importa módulos necesarios para el componente
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'web-admin';
  ocultarLayout = false; // Controla si se debe ocultar el layout principal

  constructor(
    private readonly authService: AuthService, // Servicio de autenticación
    private readonly router: Router // Servicio de enrutamiento
  ) {
    // Se suscribe a los eventos de navegación para ocultar el layout en rutas específicas
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const rutasOcultas = ['/login', '/acceso-denegado']; // Rutas donde se oculta el layout
        this.ocultarLayout = rutasOcultas.includes(this.router.url);
      });
  }

  // Método para cerrar sesión
  async logout(): Promise<void> {
    try {
      await this.authService.logout(); // Llama al servicio de logout
      await this.router.navigate(['/login']); // Redirige al login
    } catch (error) {
      console.error('Error al cerrar sesión:', error); // Maneja errores en el logout
    }
  }
}
