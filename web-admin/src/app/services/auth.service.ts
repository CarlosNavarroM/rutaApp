import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false; // Simulación de autenticación

  constructor(private readonly router: Router) {}

  // Simulación de inicio de sesión
  login(email: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (email === 'test@example.com' && password === 'password') {
        this.isAuthenticated = true;
        resolve({ message: 'Login successful' });
      } else {
        reject(new Error('Invalid credentials'));
      }
    });
  }

  // Simulación de cierre de sesión
  logout(): Promise<void> {
    return new Promise((resolve) => {
      this.isAuthenticated = false;
      this.router.navigate(['/login']);
      resolve();
    });
  }

  // Método para verificar si el usuario está autenticado
  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }
}
