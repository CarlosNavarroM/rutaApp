// src/app/services/local.service.ts
import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Local } from '../models/models';

@Injectable({ providedIn: 'root' })
export class LocalService {
  private readonly COLLECTION = 'LOCAL';

  constructor(private readonly firestore: Firestore) {}

  /** Busca el local por su nombre exacto */
  getByName(nombre: string): Observable<Local[]> {
    const colRef = collection(this.firestore, this.COLLECTION);
    const q = query(colRef, where('local', '==', nombre));
    return collectionData(q, { idField: 'id' }) as Observable<Local[]>;
  }
}
