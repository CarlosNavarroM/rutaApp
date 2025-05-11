// Interfaz para Usuario
export interface Usuario {
  id?: string; // ID generado por Firestore 
  correo: string; // Correo electrónico
  perfil: 'Administrador' | 'Conductor'; // Rol del usuario

}

// // Interfaz para Conductor (extiende Usuario)
// export interface Conductor extends Usuario {
//   nombre: string; // Nombre completo del usuario
//   rut: string; // RUT del usuario
//   telefono?: string; // Teléfono (opcional)
//   licencia: string; // Licencias del conductor (ejemplo: "A2 A4")
// }

// Interfaz para estado
export interface Estado {
  id?: string; // ID generado por Firestore
  nombre: string; // Nombre del estado (ejemplo: "En espera", "En ruta")
}

// Interfaz para Gestión
export interface Gestion {
  id?: string; // ID descriptivo
  nombre: string; // Descripción de la gestión (ejemplo: "Entrega", "Almacenaje")
}

// Interfaz para Local
export interface Local {
  id?: string; // ID descriptivo del local
  cadena: string; // Nombre de la cadena (ejemplo: "Tottus")
  comuna: string; // Comuna del local (ejemplo: "Quilicura")
  direccion: string; // Dirección del local (ejemplo: "Saladillo 303")
  link: string; // Enlace a Google Maps (ejemplo: "https://maps.app.goo.gl/3zWuBSS7bAqEyHP57")
  local: string; // Nombre del local (ejemplo: "Cd Tottus 429")
}

// Interfaz para Pais
export interface Pais {
  id?: string; // ID correlativo en Firebase Database
  nombre: string; // Nombre del país (ejemplo: "Chile")
}

//interfaz para Region (extiende Pais)
export interface Region extends Pais {
  id?: string; // ID correlativo en Firebase Database
  nombre: string; // Nombre de la región (ejemplo: "Metropolitana")
  pais: string; // Nombre del país al que pertenece la región (ejemplo: "Chile")
  idPais: string; // ID del país al que pertenece la región (ejemplo: "1")
}
// Interfaz para Ciudad (extiende Region)
export interface Ciudad extends Region {
  id?: string; // ID correlativo en Firebase Database
  nombre: string; // Nombre de la ciudad (ejemplo: "Santiago")
  region: string; // Nombre de la región a la que pertenece la ciudad (ejemplo: "Metropolitana")
  idRegion: string; // ID de la región a la que pertenece la ciudad (ejemplo: "1")
}

// Interfaz para Perfil
export interface Perfil {
  id?: string; // ID correlativo en Firebase Database
  nombre: string; // Nombre del perfil (ejemplo: "Administrador")
}

// Interfaz para Tipo de carga
export interface TipoCarga {
  id?: string; // ID correlativo en Firebase Database
  nombre: string; // Nombre del tipo de carga (ejemplo: "Fresco", "Congelado")
  temp_despacho: string; // Rango de temperatura de despacho (ejemplo: "de 0º a 3º C")
}
// Interfaz para Transporte
export interface Transporte {
  id?: string; // ID generado por Firestore
  capCarga: number; // Capacidad de carga en kg
  color: string; // Color del transporte
  marca: string; // Marca del transporte (ejemplo: "Chevrolet")
  modelo: string; // Modelo del transporte (ejemplo: "NQR 919")
  patente: string; // Patente del transporte (ejemplo: "GWCL77")
  tipo: string; // Tipo de transporte (ejemplo: "Camión", "Furgón")
}

//interfaz para Turno
export interface Turno {
  id?: string; // ID correlativo en Firebase Database
  nombre: string; // Nombre del turno (ejemplo: "Noche", "Día")
}

//interfaz para Vuelta
export interface Vuelta {
  id?: string; // ID correlativo en Firebase Database
  nombre: string; // Nombre de la vuelta (ejemplo: "Primera", "Segunda")  
}

/** Conductor (document ID = UID) */
export interface Conductor {
  id?: string;         // UID del conductor
  nombre: string;
  rut: string;
  licencia: string;
  telefono?: string;
}

/** Despacho registrado */
export interface RegistroDespacho {
  id?: string;
  conductor: string;
  estado: 'Pendiente' | 'Entregado' | 'Rechazado';
  fecha: any;          // Firestore Timestamp
  gestion: string;
  local: string;
  tipo_carga: string;
  transporte: string;
  turno: string;
  vuelta: string;
  motivoRechazo?: string;
  fechaEntrega?: Date;
  fechaRechazo?: Date;
}