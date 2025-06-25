
import { Injectable, inject, TransferState, makeStateKey } from '@angular/core';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, CollectionReference, DocumentData, QuerySnapshot,
         DocumentReference, DocumentSnapshot, query, QueryConstraint } from "firebase/firestore";
import { firebaseConfig } from '../../../../firebase/firebase-config';
import { Observable, of, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Conductor, Transporte, TipoCarga, Turno, Vuelta, Local, Gestion, Estado, Despacho } from '../models/models'; // Ensure this path is correct

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

@Injectable({
  providedIn: 'root',
})
export class FirebaseDatabaseService {
  private readonly transferState = inject(TransferState);

  constructor() { }

  async createDocument<T>(collectionPath: string, data: T): Promise<DocumentReference<T>> {
    try {
      const colRef: CollectionReference<T> = collection(db, collectionPath) as CollectionReference<T>;
      const docRef = await addDoc(colRef, data);
      console.log("Documento escrito con ID: ", docRef.id);
      return docRef;
    } catch (e) {
      console.error("Error al agregar documento: ", e);
      throw e;
    }
  }

  async readCollection(collectionPath: string, ...queryConstraints: QueryConstraint[]): Promise<QuerySnapshot<DocumentData>> {
    try {
      const colRef = collection(db, collectionPath);
      const q = query(colRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);
      return querySnapshot;
    } catch (e) {
      console.error("Error al obtener documentos:", e);
      throw e;
    }
  }

  async readDocument(collectionPath: string, documentId: string): Promise<DocumentSnapshot<DocumentData>> {
    try {
      const docRef = doc(db, collectionPath, documentId);
      const documentSnapshot = await getDoc(docRef);
      return documentSnapshot;
    } catch (e) {
      console.error("Error al obtener documento: ", e);
      throw e;
    }
  }

  async updateDocument(collectionPath: string, documentId: string, data: any): Promise<void> {
    try {
      const docRef = doc(db, collectionPath, documentId);
      await updateDoc(docRef, data);
      console.log("Documento actualizado con ID: ", documentId);
    } catch (e) {
      console.error("Error al actualizar documento: ", e);
      throw e;
    }
  }

  async deleteDocument(collectionPath: string, documentId: string): Promise<void> {
    try {
      const docRef = doc(db, collectionPath, documentId);
      await deleteDoc(docRef);
      console.log("Documento eliminado con ID: ", documentId);
    } catch (e) {
      console.error("Error al eliminar documento: ", e);
      throw e;
    }
  }

  // Métodos con TransferState implementado
  getConductores(): Observable<Conductor[]> {
    const CONDUCTORES_KEY = makeStateKey<Conductor[]>('conductores');
    const saved = this.transferState.get(CONDUCTORES_KEY, null);
    if (saved) return of(saved);

    return from(this.readCollection('CONDUCTOR')).pipe(
      map((snapshot: QuerySnapshot<DocumentData>) => {
        const data = snapshot.docs.map((doc: DocumentSnapshot<DocumentData>) => ({ id: doc.id, ...doc.data() } as Conductor));
        this.transferState.set(CONDUCTORES_KEY, data);
        return data;
      })
    );
  }

  getTransportes(): Observable<Transporte[]> {
    const TRANSPORTES_KEY = makeStateKey<Transporte[]>('transportes');
    const saved = this.transferState.get(TRANSPORTES_KEY, null);
    if (saved) return of(saved);

    return from(this.readCollection('TRANSPORTE')).pipe(
      map(snapshot => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transporte));
        this.transferState.set(TRANSPORTES_KEY, data);
        return data;
      })
    );
  }

  getTiposCarga(): Observable<TipoCarga[]> {
    const TIPOS_CARGA_KEY = makeStateKey<TipoCarga[]>('tiposCarga');
    const saved = this.transferState.get(TIPOS_CARGA_KEY, null);
    if (saved) return of(saved);

    return from(this.readCollection('TIPO_CARGA')).pipe(
      map(snapshot => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TipoCarga));
        this.transferState.set(TIPOS_CARGA_KEY, data);
        return data;
      })
    );
  }

  getTurnos(): Observable<Turno[]> {
    const TURNOS_KEY = makeStateKey<Turno[]>('turnos');
    const saved = this.transferState.get(TURNOS_KEY, null);
    if (saved) return of(saved);

    return from(this.readCollection('TURNO')).pipe(
      map(snapshot => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Turno));
        this.transferState.set(TURNOS_KEY, data);
        return data;
      })
    );
  }

  getVueltas(): Observable<Vuelta[]> {
    const VUELTAS_KEY = makeStateKey<Vuelta[]>('vueltas');
    const saved = this.transferState.get(VUELTAS_KEY, null);
    if (saved) return of(saved);

    return from(this.readCollection('VUELTA')).pipe(
      map(snapshot => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vuelta));
        this.transferState.set(VUELTAS_KEY, data);
        return data;
      })
    );
  }

  getLocales(): Observable<Local[]> {
    const LOCALES_KEY = makeStateKey<Local[]>('locales');
    const saved = this.transferState.get(LOCALES_KEY, null);
    if (saved) return of(saved);

    return from(this.readCollection('LOCAL')).pipe(
      map(snapshot => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Local));
        this.transferState.set(LOCALES_KEY, data);
        return data;
      })
    );
  }

  getGestiones(): Observable<Gestion[]> {
    const GESTIONES_KEY = makeStateKey<Gestion[]>('gestiones');
    const saved = this.transferState.get(GESTIONES_KEY, null);
    if (saved) return of(saved);

    return from(this.readCollection('GESTION')).pipe(
      map(snapshot => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gestion));
        this.transferState.set(GESTIONES_KEY, data);
        return data;
      })
    );
  }

  getEstados(): Observable<Estado[]> {
    const ESTADOS_KEY = makeStateKey<Estado[]>('estados');
    const saved = this.transferState.get(ESTADOS_KEY, null);
    if (saved) return of(saved);

    return from(this.readCollection('ESTADO')).pipe(
      map(snapshot => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Estado));
        this.transferState.set(ESTADOS_KEY, data);
        return data;
      })
    );
  }

getDespachos(): Observable<Despacho[]> {
  const colRef = collection(db, 'REGISTRO_DESPACHO');
  return from(getDocs(colRef)).pipe(
    map((snapshot: QuerySnapshot<DocumentData>) =>
      snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Despacho))
    )
  );
}
}
