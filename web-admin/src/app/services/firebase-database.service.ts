import { Injectable, inject, TransferState, makeStateKey } from '@angular/core';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, CollectionReference, DocumentData, QuerySnapshot,
         DocumentReference, DocumentSnapshot, query, QueryConstraint } from "firebase/firestore";
import { firebaseConfig } from '../../../../firebase/firebase-config'; // Importa la configuración de Firebase específica de tu proyecto
import { Observable, of, from } from 'rxjs'; // Importa Observables fundamentales de RxJS
import { map } from 'rxjs/operators'; // Importa el operador 'map' de RxJS para transformar datos
// Asegúrate de que esta ruta sea correcta para tus modelos de datos
import { Conductor, Transporte, TipoCarga, Turno, Vuelta, Local, Gestion, Estado } from '../models/models';

// ---
// Inicialización de Firebase
// ---

// Inicializa la aplicación de Firebase con la configuración proporcionada.
// Esto debe hacerse una sola vez en tu aplicación.
const app = initializeApp(firebaseConfig);
// Obtiene una instancia de Firestore, la base de datos NoSQL de Firebase.
const db = getFirestore(app);

// ---
// Servicio FirebaseDatabaseService
// ---

/**
 * @Injectable
 * Servicio de Angular para interactuar con la base de datos Firebase Firestore.
 * Proporciona una interfaz para realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar)
 * en las colecciones de Firestore.
 *
 * Además, implementa la optimización de **TransferState** de Angular Universal,
 * lo que permite que los datos fetched durante el Server-Side Rendering (SSR)
 * se transfieran al cliente, evitando una segunda llamada a la base de datos
 * y mejorando el rendimiento inicial de la aplicación.
 */
@Injectable({
  providedIn: 'root', // El servicio es un singleton y está disponible en toda la aplicación.
})
export class FirebaseDatabaseService {
  // Inyecta el servicio TransferState, fundamental para la transferencia de datos en SSR.
  private readonly transferState = inject(TransferState);

  constructor() {
    // El constructor puede ser usado para inicializaciones adicionales si son necesarias.
  }

  // ---
  // Métodos CRUD (Crear, Leer, Actualizar, Eliminar)
  // ---

  /**
   * Crea un nuevo documento en una colección específica de Firestore.
   * @template T El tipo de los datos que se van a guardar en el documento.
   * @param collectionPath La ruta de la colección donde se creará el documento (ej. 'usuarios').
   * @param data El objeto de datos que se agregará al documento. Firestore infiere el esquema.
   * @returns Una `Promise` que resuelve con la `DocumentReference` del documento recién creado,
   * permitiendo acceder a su ID.
   * @throws Un error si falla la operación de escritura, que debe ser capturado por el llamador.
   */
  async createDocument<T>(collectionPath: string, data: T): Promise<DocumentReference<T>> {
    try {
      // Obtiene una referencia a la colección de Firestore, tipada para mayor seguridad.
      const colRef: CollectionReference<T> = collection(db, collectionPath) as CollectionReference<T>;
      // Agrega un nuevo documento a la colección. Firestore asigna un ID automático.
      const docRef = await addDoc(colRef, data);
      console.log("Documento escrito con ID: ", docRef.id);
      return docRef;
    } catch (e) {
      console.error("Error al agregar documento: ", e);
      // Relanza el error para que el componente o servicio que llamó a este método pueda manejarlo.
      throw e;
    }
  }

  /**
   * Lee documentos de una colección específica de Firestore.
   * Permite aplicar múltiples restricciones de consulta (filtros, ordenamiento, límites).
   * @param collectionPath La ruta de la colección de la que se leerán los documentos.
   * @param queryConstraints Un número variable de `QueryConstraint` (ej. `where('campo', '==', 'valor')`,
   * `orderBy('campo')`, `limit(10)`).
   * @returns Una `Promise` que resuelve con un `QuerySnapshot` que contiene los documentos que
   * coinciden con la consulta.
   * @throws Un error si falla la operación de lectura.
   */
  async readCollection(collectionPath: string, ...queryConstraints: QueryConstraint[]): Promise<QuerySnapshot<DocumentData>> {
    try {
      // Obtiene una referencia a la colección.
      const colRef = collection(db, collectionPath);
      // Construye la consulta aplicando todas las restricciones proporcionadas.
      const q = query(colRef, ...queryConstraints);
      // Ejecuta la consulta y obtiene el snapshot con los resultados.
      const querySnapshot = await getDocs(q);
      return querySnapshot;
    } catch (e) {
      console.error("Error al obtener documentos:", e);
      throw e;
    }
  }

  /**
   * Lee un documento específico de una colección por su ID.
   * @param collectionPath La ruta de la colección donde se encuentra el documento.
   * @param documentId El ID único del documento a leer.
   * @returns Una `Promise` que resuelve con un `DocumentSnapshot` del documento.
   * El snapshot contiene los datos del documento y metadatos (`exists()`, `data()`).
   * @throws Un error si falla la operación de lectura.
   */
  async readDocument(collectionPath: string, documentId: string): Promise<DocumentSnapshot<DocumentData>> {
    try {
      // Obtiene una referencia a un documento específico dentro de la colección.
      const docRef = doc(db, collectionPath, documentId);
      // Obtiene el snapshot del documento.
      const documentSnapshot = await getDoc(docRef);
      return documentSnapshot;
    } catch (e) {
      console.error("Error al obtener documento: ", e);
      throw e;
    }
  }

  /**
   * Actualiza un documento existente en una colección.
   * @param collectionPath La ruta de la colección donde se encuentra el documento.
   * @param documentId El ID del documento a actualizar.
   * @param data Los datos a actualizar. Puede ser un objeto parcial (merge) o completo.
   * @returns Una `Promise<void>` que resuelve cuando la actualización es exitosa.
   * @throws Un error si falla la operación de actualización.
   */
  async updateDocument(collectionPath: string, documentId: string, data: any): Promise<void> {
    try {
      // Obtiene una referencia al documento específico.
      const docRef = doc(db, collectionPath, documentId);
      // Actualiza el documento con los nuevos datos.
      await updateDoc(docRef, data);
      console.log("Documento actualizado con ID: ", documentId);
    } catch (e) {
      console.error("Error al actualizar documento: ", e);
      throw e;
    }
  }

  /**
   * Elimina un documento específico de una colección.
   * @param collectionPath La ruta de la colección donde se encuentra el documento.
   * @param documentId El ID del documento a eliminar.
   * @returns Una `Promise<void>` que resuelve cuando la eliminación es exitosa.
   * @throws Un error si falla la operación de eliminación.
   */
  async deleteDocument(collectionPath: string, documentId: string): Promise<void> {
    try {
      // Obtiene una referencia al documento específico.
      const docRef = doc(db, collectionPath, documentId);
      // Elimina el documento de Firestore.
      await deleteDoc(docRef);
      console.log("Documento eliminado con ID: ", documentId);
    } catch (e) {
      console.error("Error al eliminar documento: ", e);
      throw e;
    }
  }

  // ---
  // Métodos de lectura con TransferState para optimización en SSR
  // ---

  /**
   * Obtiene la lista de **Conductores** desde Firestore.
   * Este método utiliza **TransferState** para optimizar la carga de datos en aplicaciones
   * de Angular Universal (SSR). Si los datos ya fueron precargados en el servidor,
   * se recuperan del TransferState; de lo contrario, se realizan la llamada a Firestore.
   *
   * @returns Un `Observable` que emite un array de objetos `Conductor`.
   */
  getConductores(): Observable<Conductor[]> {
    // Define una clave única para almacenar y recuperar el estado de los conductores.
    const CONDUCTORES_KEY = makeStateKey<Conductor[]>('conductores');
    // Intenta obtener los datos del estado transferido desde el servidor.
    const saved = this.transferState.get(CONDUCTORES_KEY, null);

    // Si los datos ya existen en TransferState (fueron precargados durante SSR),
    // los devuelve inmediatamente como un Observable completo (`of`).
    if (saved) {
      console.log('TransferState: Conductores recuperados del estado transferido.');
      return of(saved);
    }

    // Si los datos no están en TransferState, realiza la lectura desde Firestore.
    // `from(this.readCollection(...))` convierte la Promise resultante en un Observable.
    return from(this.readCollection('CONDUCTOR')).pipe(
      // Mapea el `QuerySnapshot` de Firestore a un array de objetos `Conductor`.
      map((snapshot: QuerySnapshot<DocumentData>) => {
        const data = snapshot.docs.map((doc: DocumentSnapshot<DocumentData>) => ({ id: doc.id, ...doc.data() } as Conductor));
        // Almacena los datos recién obtenidos en TransferState para que estén disponibles
        // en el lado del cliente y se evite una nueva llamada a la base de datos.
        this.transferState.set(CONDUCTORES_KEY, data);
        console.log('Firestore: Conductores obtenidos de la base de datos y guardados en TransferState.');
        return data;
      })
    );
  }

  /**
   * Obtiene la lista de **Transportes** desde Firestore, con optimización de TransferState.
   * @returns Un `Observable` que emite un array de objetos `Transporte`.
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
   * Obtiene la lista de **Tipos de Carga** desde Firestore, con optimización de TransferState.
   * @returns Un `Observable` que emite un array de objetos `TipoCarga`.
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
   * Obtiene la lista de **Turnos** desde Firestore, con optimización de TransferState.
   * @returns Un `Observable` que emite un array de objetos `Turno`.
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
   * Obtiene la lista de **Vueltas** desde Firestore, con optimización de TransferState.
   * @returns Un `Observable` que emite un array de objetos `Vuelta`.
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
   * Obtiene la lista de **Locales** desde Firestore, con optimización de TransferState.
   * @returns Un `Observable` que emite un array de objetos `Local`.
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
   * Obtiene la lista de **Gestiones** desde Firestore, con optimización de TransferState.
   * @returns Un `Observable` que emite un array de objetos `Gestion`.
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
   * Obtiene la lista de **Estados** desde Firestore, con optimización de TransferState.
   * @returns Un `Observable` que emite un array de objetos `Estado`.
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
}