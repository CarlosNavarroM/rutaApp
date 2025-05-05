import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, addDoc, deleteDoc, DocumentReference, Firestore } from 'firebase/firestore';
import { firebaseConfig } from '../../../../firebase/firebase-config'; // Asegúrate de importar tu configuración
import { from, Observable, switchMap, map, catchError, of } from 'rxjs';
import { CollectionReference } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseDatabaseService {
  private readonly app = initializeApp(firebaseConfig); // Marcado como readonly
  private readonly db: Firestore = getFirestore(this.app); // Marcado como readonly y con tipo

  constructor() {}

  // Mejora 1: Retornar Observables para un mejor manejo asíncrono y en la UI
  writeData(collectionPath: string, data: any): Observable<DocumentReference> {
    const colRef = collection(this.db, collectionPath);
    return from(addDoc(colRef, data));
  }

  // Mejora 1: Retornar Observables para un mejor manejo asíncrono y en la UI
  readData(collectionPath: string, documentId: string): Observable<any | null> {
    const docRef = doc(this.db, collectionPath, documentId);
    return from(getDoc(docRef)).pipe(
      map(snapshot => snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null),
      catchError(error => {
        console.error(`Error reading document in ${collectionPath}/${documentId}:`, error);
        return of(null); // Retorna un observable con null en caso de error
      })
    );
  }

  // Mejora 1: Retornar Observables para un mejor manejo asíncrono y en la UI
  readCollectionData(collectionPath: string): Observable<any[]> {
    const colRef = collection(this.db, collectionPath);
    return from(getDocs(colRef)).pipe(
      map(snapshot => {
        if (snapshot.empty) {
          console.log(`No documents in collection ${collectionPath}`);
          return [];
        } else {
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      }),
      catchError(error => {
        console.error(`Error reading collection ${collectionPath}:`, error);
        return of([]); // Retorna un observable con un array vacío en caso de error
      })
    );
  }

  // Mejora 1: Retornar Observables para un mejor manejo asíncrono y en la UI
  deleteData(collectionPath: string, documentId: string): Observable<void> {
    const docRef = doc(this.db, collectionPath, documentId);
    return from(deleteDoc(docRef));
  }

  // Mejora 2: Método para actualizar un documento existente
  updateData(collectionPath: string, documentId: string, data: any): Observable<void> {
    const docRef = doc(this.db, collectionPath, documentId);
    return from(setDoc(docRef, data, { merge: true })); // 'merge: true' para actualizar solo los campos proporcionados
  }

  // Mejora 3: Método para obtener la referencia a un documento (útil en casos avanzados)
  getDocumentReference(collectionPath: string, documentId: string): DocumentReference {
    return doc(this.db, collectionPath, documentId);
  }

  // Mejora 4: Método para obtener la referencia a una colección (útil en casos avanzados)
  getCollectionReference(collectionPath: string): CollectionReference {
    return collection(this.db, collectionPath);
  }
}

