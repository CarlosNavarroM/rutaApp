import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Guard de autenticación y autorización para rutas protegidas.
 *
 * Este guard verifica si el usuario está autenticado y si su perfil corresponde
 * a uno de los roles permitidos ('Administrador' o 'Gerencia'). Si el usuario no está autenticado,
 * es redirigido a la página de login. Si el usuario está autenticado pero no tiene el perfil adecuado,
 * es redirigido a la página de acceso denegado.
 *
 * @param route - Snapshot de la ruta activada.
 * @param state - Estado del router al intentar activar la ruta.
 * @returns `true` si el usuario está autenticado y autorizado, `false` en caso contrario.
 *
 * @remarks
 * - Utiliza el servicio `AuthService` para obtener el usuario y su perfil.
 * - Utiliza el servicio `Router` para realizar redirecciones según el caso.
 * - Maneja errores redirigiendo al login y registrando el error en consola.
 */
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
