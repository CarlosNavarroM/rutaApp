import { Injectable } from '@angular/core';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from '../../../../firebase/firebase-config';
import { Conductor, Usuario } from '../models/models';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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

  async registerConductor(conductor: Conductor): Promise<void> {
    try {
      // Crear usuario en Firebase Authentication con una contraseña temporal
      const userCredential = await createUserWithEmailAndPassword(auth, conductor.correo, 'Temporal123!');
      const userId = userCredential.user.uid;
  
      // Guardar los datos en la colección "USUARIO"
      await setDoc(doc(db, 'USUARIO', userId), {
        id: userId,
        correo: conductor.correo,
        perfil: 'Conductor' // Siempre será "Conductor" en este caso
      });
  
      // Guardar los datos en la colección "CONDUCTOR"
      await setDoc(doc(db, 'CONDUCTOR', userId), {
        nombre: conductor.nombre,
        rut: conductor.rut,
        telefono: conductor.telefono,
        licencia: conductor.licencia
      });
  
      // Enviar correo de restablecimiento de contraseña
      await sendPasswordResetEmail(auth, conductor.correo);
      console.log('Conductor registrado en ambas colecciones y correo de restablecimiento enviado.');
    } catch (error) {
      console.error('Error al registrar al conductor:', error);
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


  async registerAdmin(admin: Usuario): Promise<void> {
    try {
      // Crear usuario en Firebase Authentication con una contraseña temporal
      const userCredential = await createUserWithEmailAndPassword(auth, admin.correo, 'Temporal123!');
      const userId = userCredential.user.uid;
  
      // Guardar los datos en la colección "USUARIO"
      await setDoc(doc(db, 'USUARIO', userId), {
        id: userId,
        correo: admin.correo,
        perfil: admin.perfil // Siempre será "Administrador" en este caso
      });
  
      // Enviar correo de restablecimiento de contraseña
      await sendPasswordResetEmail(auth, admin.correo);
      console.log('Administrador registrado y correo de restablecimiento enviado.');
    } catch (error) {
      console.error('Error al registrar al administrador:', error);
      throw error;
    }
  }
}