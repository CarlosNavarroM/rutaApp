import { Injectable } from '@angular/core';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../firebase-config'; // Asegúrate de importar tu configuración de Firebase

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {}

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

  async register(email: string, password: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Registro exitoso');
      console.log('Correo:', userCredential.user.email);
      console.log('ID:', userCredential.user.uid);
    } catch (error) {
      console.error('Error en el registro:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
      console.log('Logout exitoso');
    } catch (error) {
      console.error('Error en el logout:', error);
      throw error;
    }
  }
}
