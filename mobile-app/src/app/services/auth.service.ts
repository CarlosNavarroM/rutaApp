import { Injectable } from '@angular/core';
import {
  getAuth,
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../../../firebase/firebase-config';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

@Injectable({ providedIn: 'root' })
export class AuthService {
  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async register(email: string, password: string): Promise<void> {
    await createUserWithEmailAndPassword(auth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  /** Recupera el usuario actual desde Firebase */
  async getCurrentUser(): Promise<User | null> {
    console.log('AuthService.getCurrentUser() called');
    return new Promise(resolve => {
      console.log('AuthService.getCurrentUser: subscribing to auth state changes');
      const unsubscribe = onAuthStateChanged(auth, user => {
        console.log('AuthService.getCurrentUser: auth state changed, user:', user);
        unsubscribe();
        resolve(user);
      });
    });
  }

  /** Envía un correo para restablecer la contraseña */
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }
}
