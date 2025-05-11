import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { RegistroDespacho } from '../models/models';

@Injectable({ providedIn: 'root' })
export class DispatchService {
  private readonly COLLECTION = 'REGISTRO_DESPACHO';

  constructor(private readonly firestore: Firestore) {}

  /**
   * Devuelve todos los despachos cuyo campo `conductor` === nombre
   */
  getByConductorNombre(nombre: string): Observable<RegistroDespacho[]> {
    const colRef = collection(this.firestore, this.COLLECTION);
    const q = query(colRef, where('conductor', '==', nombre));
    return collectionData(q, { idField: 'id' }) as Observable<RegistroDespacho[]>;
  }

  /** Marca un despacho como entregado */
  async marcarEntregado(id: string): Promise<void> {
    const ref = doc(this.firestore, this.COLLECTION, id);
    await updateDoc(ref, { estado: 'Entregado', fechaEntrega: new Date() });
  }

  /** Marca un despacho como rechazado con motivo */
  async marcarRechazado(id: string, motivoRechazo: string): Promise<void> {
    const ref = doc(this.firestore, this.COLLECTION, id);
    await updateDoc(ref, {
      estado: 'Rechazado',
      motivoRechazo,
      fechaRechazo: new Date()
    });
  }
}