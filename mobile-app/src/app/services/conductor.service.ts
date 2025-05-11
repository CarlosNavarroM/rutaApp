import { Injectable } from '@angular/core';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Conductor } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ConductorService {
  private readonly COLLECTION = 'CONDUCTOR';

  constructor(private readonly firestore: Firestore) {}

  /** Retorna el perfil de conductor según UID */
  getById(uid: string): Observable<Conductor> {
    const ref = doc(this.firestore, this.COLLECTION, uid);
    return docData(ref, { idField: 'id' }) as Observable<Conductor>;
  }
}