import { Injectable, inject, TransferState, makeStateKey } from '@angular/core';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, CollectionReference, DocumentData, QuerySnapshot,
  DocumentReference, DocumentSnapshot, query, QueryConstraint } from "firebase/firestore";
import { firebaseConfig } from '../../../../firebase/firebase-config';
import { Observable, of, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Conductor, Transporte, TipoCarga, Turno, Vuelta, Local, Gestion, Estado, Despacho } from '../models/models'; // Ensure this path is correct


// Inicializa la aplicación de Firebase con la configuración proporcionada
const app = initializeApp(firebaseConfig);
// Obtiene la instancia de Firestore
const db = getFirestore(app);

@Injectable({
  providedIn: 'root',
})
export class FirebaseDatabaseService {
  // Inyección de TransferState para transferencia de estado entre servidor y cliente
  private readonly transferState = inject(TransferState);

  constructor() {}

  /**
   * Crea un documento en la colección especificada.
   * @param collectionPath Ruta de la colección
   * @param data Datos a guardar
   */
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

  /**
   * Lee todos los documentos de una colección, opcionalmente con restricciones de consulta.
   * @param collectionPath Ruta de la colección
   * @param queryConstraints Restricciones de consulta (opcional)
   */
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

  /**
   * Lee un documento específico de una colección.
   * @param collectionPath Ruta de la colección
   * @param documentId ID del documento
   */
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

  /**
   * Actualiza un documento existente en una colección.
   * @param collectionPath Ruta de la colección
   * @param documentId ID del documento
   * @param data Datos a actualizar
   */
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

  /**
   * Elimina un documento de una colección.
   * @param collectionPath Ruta de la colección
   * @param documentId ID del documento
   */
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

  /**
   * Obtiene la lista de conductores, usando TransferState para optimizar SSR.
   */
  getConductores(): Observable<Conductor[]> {
    const CONDUCTORES_KEY = makeStateKey<Conductor[]>('conductores');
    const saved = this.transferState.get(CONDUCTORES_KEY, null);
    if (saved) {
   console.log('TransferState: Conductores recuperados del estado transferido.');
   return of(saved);
    }
    return from(this.readCollection('CONDUCTOR')).pipe(
   map((snapshot: QuerySnapshot<DocumentData>) => {
     const data = snapshot.docs.map((doc: DocumentSnapshot<DocumentData>) => ({ id: doc.id, ...doc.data() } as Conductor));
     this.transferState.set(CONDUCTORES_KEY, data);
     console.log('Firestore: Conductores obtenidos de la base de datos y guardados en TransferState.');
     return data;
   })
    );
  }

  /**
   * Obtiene la lista de transportes, usando TransferState.
   */
  getTransportes(): Observable<Transporte[]> {
    const TRANSPORTES_KEY = makeStateKey<Transporte[]>('transportes');
    const saved = this.transferState.get(TRANSPORTES_KEY, null);
    if (saved) {
   console.log('TransferState: Transportes recuperados del estado transferido.');
   return of(saved);
    }
    return from(this.readCollection('TRANSPORTE')).pipe(
   map(snapshot => {
     const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transporte));
     this.transferState.set(TRANSPORTES_KEY, data);
     console.log('Firestore: Transportes obtenidos de la base de datos y guardados en TransferState.');
     return data;
   })
    );
  }

  /**
   * Obtiene la lista de tipos de carga, usando TransferState.
   */
  getTiposCarga(): Observable<TipoCarga[]> {
    const TIPOS_CARGA_KEY = makeStateKey<TipoCarga[]>('tiposCarga');
    const saved = this.transferState.get(TIPOS_CARGA_KEY, null);
    if (saved) {
   console.log('TransferState: Tipos de Carga recuperados del estado transferido.');
   return of(saved);
    }
    return from(this.readCollection('TIPO_CARGA')).pipe(
   map(snapshot => {
     const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TipoCarga));
     this.transferState.set(TIPOS_CARGA_KEY, data);
     console.log('Firestore: Tipos de Carga obtenidos de la base de datos y guardados en TransferState.');
     return data;
   })
    );
  }

  /**
   * Obtiene la lista de turnos, usando TransferState.
   */
  getTurnos(): Observable<Turno[]> {
    const TURNOS_KEY = makeStateKey<Turno[]>('turnos');
    const saved = this.transferState.get(TURNOS_KEY, null);
    if (saved) {
   console.log('TransferState: Turnos recuperados del estado transferido.');
   return of(saved);
    }
    return from(this.readCollection('TURNO')).pipe(
   map(snapshot => {
     const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Turno));
     this.transferState.set(TURNOS_KEY, data);
     console.log('Firestore: Turnos obtenidos de la base de datos y guardados en TransferState.');
     return data;
   })
    );
  }

  /**
   * Obtiene la lista de vueltas, usando TransferState.
   */
  getVueltas(): Observable<Vuelta[]> {
    const VUELTAS_KEY = makeStateKey<Vuelta[]>('vueltas');
    const saved = this.transferState.get(VUELTAS_KEY, null);
    if (saved) {
   console.log('TransferState: Vueltas recuperadas del estado transferido.');
   return of(saved);
    }
    return from(this.readCollection('VUELTA')).pipe(
   map(snapshot => {
     const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vuelta));
     this.transferState.set(VUELTAS_KEY, data);
     console.log('Firestore: Vueltas obtenidas de la base de datos y guardadas en TransferState.');
     return data;
   })
    );
  }

  /**
   * Obtiene la lista de locales, usando TransferState.
   */
  getLocales(): Observable<Local[]> {
    const LOCALES_KEY = makeStateKey<Local[]>('locales');
    const saved = this.transferState.get(LOCALES_KEY, null);
    if (saved) {
   console.log('TransferState: Locales recuperados del estado transferido.');
   return of(saved);
    }
    return from(this.readCollection('LOCAL')).pipe(
   map(snapshot => {
     const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Local));
     this.transferState.set(LOCALES_KEY, data);
     console.log('Firestore: Locales obtenidos de la base de datos y guardados en TransferState.');
     return data;
   })
    );
  }

  /**
   * Obtiene la lista de gestiones, usando TransferState.
   */
  getGestiones(): Observable<Gestion[]> {
    const GESTIONES_KEY = makeStateKey<Gestion[]>('gestiones');
    const saved = this.transferState.get(GESTIONES_KEY, null);
    if (saved) {
   console.log('TransferState: Gestiones recuperadas del estado transferido.');
   return of(saved);
    }
    return from(this.readCollection('GESTION')).pipe(
   map(snapshot => {
     const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gestion));
     this.transferState.set(GESTIONES_KEY, data);
     console.log('Firestore: Gestiones obtenidas de la base de datos y guardadas en TransferState.');
     return data;
   })
    );
  }

  /**
   * Obtiene la lista de estados, usando TransferState.
   */
  getEstados(): Observable<Estado[]> {
    const ESTADOS_KEY = makeStateKey<Estado[]>('estados');
    const saved = this.transferState.get(ESTADOS_KEY, null);
    if (saved) {
   console.log('TransferState: Estados recuperados del estado transferido.');
   return of(saved);
    }
    return from(this.readCollection('ESTADO')).pipe(
   map(snapshot => {
     const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Estado));
     this.transferState.set(ESTADOS_KEY, data);
     console.log('Firestore: Estados obtenidos de la base de datos y guardados en TransferState.');
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
