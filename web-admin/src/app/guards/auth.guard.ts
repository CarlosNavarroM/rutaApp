import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    const usuario = await authService.getUsuarioConPerfil();

    if (!usuario) {
      router.navigate(['/login']);
      return false;
    }

    const rolesPermitidos = ['Administrador', 'Gerencia'];
    if (rolesPermitidos.includes(usuario.perfil)) {
      return true;
    } else {
      router.navigate(['/acceso-denegado']);
      return false;
    }
  } catch (error) {
    console.error('Error en el guard:', error);
    router.navigate(['/login']);
    return false;
  }
};
