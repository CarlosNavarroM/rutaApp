// Interfaz para Usuario
export interface Usuario {
    id?: string; // ID generado por Firestore 
    correo: string; // Correo electrónico
    perfil: 'Administrador' | 'Conductor'; // Rol del usuario
   
  }

  // Interfaz para Conductor (extiende Usuario)
  export interface Conductor extends Usuario {
    nombre: string; // Nombre completo del usuario
    rut: string; // RUT del usuario
    telefono?: string; // Teléfono (opcional)
    licencia: string; // Licencias del conductor (ejemplo: "A2 A4")
  }

  