import { Injectable } from '@angular/core';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, CollectionReference, DocumentData, QuerySnapshot,
         DocumentReference, DocumentSnapshot, query, QueryConstraint } from "firebase/firestore";
import { firebaseConfig } from '../../../../firebase/firebase-config';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

@Injectable({
  providedIn: 'root'
})
export class FirebaseDatabaseService {

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
}