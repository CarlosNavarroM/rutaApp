import { Injectable } from '@angular/core';
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  getDoc,
  doc,
  setDoc
} from 'firebase/firestore';
import { firebaseConfig } from '../../../../firebase/firebase-config';
import { Conductor, Usuario } from '../models/models';

// Inicializa la app de Firebase y los servicios de autenticación y Firestore
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {}

  /**
   * Inicia sesión con correo y contraseña.
   * @param email Correo electrónico del usuario.
   * @param password Contraseña del usuario.
   */
  async login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login exitoso');
      console.log('Correo:', userCredential.user.email);
      console.log('ID:', userCredential.user.uid);
    } catch (error) {
      console.error('Error en el login:', error);
      throw error;
    }
  }

  /**
   * Envía un correo para restablecer la contraseña.
   * @param email Correo electrónico del usuario.
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Correo de recuperación enviado a:', email);
    } catch (error) {
      console.error('Error al enviar el correo de recuperación:', error);
      throw error;
    }
  }

  /**
   * Registra un nuevo conductor en Firebase Auth y Firestore.
   * @param conductor Objeto con los datos del conductor.
   */
  async registerConductor(conductor: Conductor): Promise<void> {
    try {
      // Crea el usuario en Firebase Auth con una contraseña temporal
      const userCredential = await createUserWithEmailAndPassword(auth, conductor.correo, 'Temporal123!');
      const userId = userCredential.user.uid;

      // Guarda los datos básicos en la colección USUARIO
      await setDoc(doc(db, 'USUARIO', userId), {
        id: userId,
        correo: conductor.correo,
        perfil: 'Conductor'
      });

      // Guarda los datos específicos del conductor en la colección CONDUCTOR
      await setDoc(doc(db, 'CONDUCTOR', userId), {
        nombre: conductor.nombre,
        rut: conductor.rut,
        telefono: conductor.telefono,
        licencia: conductor.licencia
      });

      // Envía correo para que el conductor cambie su contraseña
      await sendPasswordResetEmail(auth, conductor.correo);
      console.log('Conductor registrado en ambas colecciones y correo de restablecimiento enviado.');
    } catch (error) {
      console.error('Error al registrar al conductor:', error);
      throw error;
    }
  }

  /**
   * Cierra la sesión del usuario actual.
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth);
      console.log('Logout exitoso');
    } catch (error) {
      console.error('Error en el logout:', error);
      throw error;
    }
  }

  /**
   * Registra un nuevo administrador en Firebase Auth y Firestore.
   * @param admin Objeto con los datos del administrador.
   */
  async registerAdmin(admin: Usuario): Promise<void> {
    try {
      // Crea el usuario en Firebase Auth con una contraseña temporal
      const userCredential = await createUserWithEmailAndPassword(auth, admin.correo, 'Temporal123!');
      const userId = userCredential.user.uid;

      // Guarda los datos del administrador en la colección USUARIO
      await setDoc(doc(db, 'USUARIO', userId), {
        id: userId,
        correo: admin.correo,
        perfil: admin.perfil
      });

      // Envía correo para que el administrador cambie su contraseña
      await sendPasswordResetEmail(auth, admin.correo);
      console.log('Administrador registrado y correo de restablecimiento enviado.');
    } catch (error) {
      console.error('Error al registrar al administrador:', error);
      throw error;
    }
  }

  /**
   * Obtiene los datos del usuario autenticado junto con su perfil.
   * @returns Objeto Usuario o null si no hay usuario autenticado.
   */
  async getUsuarioConPerfil(): Promise<Usuario | null> {
    const user = auth.currentUser;
    if (!user) return null;

    const userDocRef = doc(db, 'USUARIO', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return userDoc.data() as Usuario;
    } else {
      return null;
    }
  }
}
