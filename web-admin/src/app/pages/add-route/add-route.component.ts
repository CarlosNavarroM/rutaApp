import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Importa el servicio con su nombre y ruta correctos
import { FirebaseDatabaseService } from '../../services/firebase-database.service';

// Importa orderBy, where, y QueryConstraint de Firestore
import { orderBy, where, QueryConstraint } from 'firebase/firestore'; // Importa orderBy, where, QueryConstraint

import { Observable, BehaviorSubject, switchMap, forkJoin, of, map, Subject, takeUntil, from } from 'rxjs';

// Modelos
import { Usuario, Conductor, Transporte, TipoCarga, Turno, Vuelta, Local, Gestion, Estado } from '../../models/models';

@Component({
  selector: 'app-add-route',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-route.component.html',
  styleUrls: ['./add-route.component.scss']
})
export class AddRouteComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  private refreshData$ = new BehaviorSubject<void>(undefined);

  filterCriteria = {
    conductor: '',
    fecha: '', // Almacenará la fecha en formato string 'yyyy-mm-dd' del input type="date"
    turno: ''
  };


  registros$: Observable<any[]> = this.refreshData$.pipe(
    switchMap(() => {
      const queryConstraints: QueryConstraint[] = [];

      // Siempre ordenar por fecha descendente
      queryConstraints.push(orderBy('fecha', 'desc'));

      // Añadir cláusulas 'where' solo si el filtro tiene un valor

      if (this.filterCriteria.conductor) {
        // Asegúrate de que el valor en filterCriteria.conductor coincida exactamente con el campo en Firestore
        queryConstraints.push(where('conductor', '==', this.filterCriteria.conductor));
      }

      if (this.filterCriteria.turno) {
        // Asegúrate de que el valor en filterCriteria.turno coincida exactamente con el campo en Firestore
        queryConstraints.push(where('turno', '==', this.filterCriteria.turno));
      }

      if (this.filterCriteria.fecha) {
        // >>>>>>>>>> LÓGICA DE FILTRO POR FECHA CORREGIDA (usando UTC) <<<<<<<<<<
        const selectedDate = new Date(this.filterCriteria.fecha); // Obtiene la fecha local del input

        // Calcula el inicio y fin del día seleccionado en UTC
        const startOfDayUtc = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0, 0));
        const endOfDayUtc = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59, 999));

        queryConstraints.push(where('fecha', '>=', startOfDayUtc));
        queryConstraints.push(where('fecha', '<=', endOfDayUtc));

        // IMPORTANTE: Consulta compuesta potencial -> verifica la consola de Firebase para índices
        // <<<<<<<<<< FIN LÓGICA DE FILTRO POR FECHA CORREGIDA <<<<<<<<<<
      }

      // Llamar al servicio readCollection con las restricciones de consulta construidas
      return from(this.dbService.readCollection('REGISTRO_DESPACHO', ...queryConstraints)).pipe(
        map(querySnapshot => querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      );
    }),
    map((registros: any[]) => {
      return registros.map((registro: any) => {
        // Convertir el Timestamp de Firestore a Date si es necesario (Firestore ya nos los dio ordenados y filtrados)
        registro.fecha = registro.fecha?.toDate ? registro.fecha.toDate() : (registro.fecha instanceof Date ? registro.fecha : new Date(registro.fecha));
        return registro;
      });
      // El ordenamiento ya viene del servidor, no necesitamos el .sort() aquí
    }),
    takeUntil(this.destroy$)
  );


  cargando: boolean = true;

  // Declaración de los Observables para las opciones de los selectores de filtro
  conductores$!: Observable<any[]>;
  transportes$!: Observable<any[]>;
  tiposCarga$!: Observable<any[]>;
  turnos$!: Observable<any[]>;
  vueltas$!: Observable<any[]>;
  locales$!: Observable<any[]>;
  gestiones$!: Observable<any[]>;
  estados$!: Observable<any[]>;


  nuevoRegistro: any = {
    conductor: '',
    transporte: '',
    tipo_carga: '',
    turno: '',
    vuelta: '',
    local: '',
    gestion: '',
    estado: 'Pendiente',
    fecha: ''
  };

  constructor(private dbService: FirebaseDatabaseService) { }

  ngOnInit() {
    // Inicializar los Observables para las opciones de los selectores (conductores, turnos, etc.)
    this.conductores$ = from(this.dbService.readCollection('CONDUCTOR')).pipe(
      map(querySnapshot => querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    );
    this.transportes$ = from(this.dbService.readCollection('TRANSPORTE')).pipe(
      map(querySnapshot => querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    );
    this.tiposCarga$ = from(this.dbService.readCollection('TIPO_CARGA')).pipe(
      map(querySnapshot => querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    );
    this.turnos$ = from(this.dbService.readCollection('TURNO')).pipe(
      map(querySnapshot => querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    );
    this.vueltas$ = from(this.dbService.readCollection('VUELTA')).pipe(
      map(querySnapshot => querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    );
    this.locales$ = from(this.dbService.readCollection('LOCAL')).pipe(
      map(querySnapshot => querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    );
    this.gestiones$ = from(this.dbService.readCollection('GESTION')).pipe(
      map(querySnapshot => querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    );
    this.estados$ = from(this.dbService.readCollection('ESTADO')).pipe(
      map(querySnapshot => querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    );


    // Suscribirse a la carga de las opciones del formulario y a la lista principal de registros
    this.subscribeToFormOptions(); // Esta suscripción inicializa la carga de opciones
    // La carga inicial de registros se disparará desde subscribeToFormOptions cuando las opciones estén listas
    this.subscribeToRegistros();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    console.log('Componente AddRouteComponent destruido, suscripciones canceladas.');
  }

  agregarRegistro() {
    const nuevo = {
      ...this.nuevoRegistro,
      fecha: new Date(this.nuevoRegistro.fecha) // Asegúrate que la fecha se envíe como objeto Date
    };

    console.log('Datos que se enviarán a createDocument:', nuevo);

    from(this.dbService.createDocument('REGISTRO_DESPACHO', nuevo)).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (docRef) => {
          console.log('Nuevo registro agregado con ID:', docRef.id);
          this.resetNuevoRegistro();
          this.refreshData$.next(); // Dispara la recarga de datos con los filtros actuales
        },
        error: (error) => {
          console.error('Error al agregar el registro:', error);
        }
      });
  }

  confirmarEliminar(id: string) {
    const confirmado = confirm('¿Estás seguro que quieres eliminar este registro?');
    if (confirmado) {
      this.eliminarRegistro(id);
    }
  }

  eliminarRegistro(id: string) {
    from(this.dbService.deleteDocument('REGISTRO_DESPACHO', id)).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log(`Registro ${id} eliminado`);
          this.refreshData$.next(); // Dispara la recarga de datos con los filtros actuales
        },
        error: (error) => {
          console.error('Error al eliminar el registro:', error);
        }
      });
  }

  private subscribeToFormOptions() {
     // Esta suscripción espera a que los Observables de opciones emitan al menos un valor
     // para saber que los datos para los selectores (y filtros) están disponibles.
    forkJoin([
      this.conductores$,
      this.transportes$,
      this.tiposCarga$,
      this.turnos$,
      this.vueltas$,
      this.locales$,
      this.gestiones$,
      this.estados$
    ]).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Datos de opciones de formulario y filtro cargados.');
          // Una vez que las opciones están cargadas, disparamos la primera carga de registros
          this.refreshData$.next();
        },
        error: (error) => {
          console.error('Error al obtener los datos de opciones:', error);
          this.cargando = false; // Indica que la carga terminó, incluso si hubo un error
        }
      });
  }

  private subscribeToRegistros() {
    this.registros$ // Este Observable ya tiene el pipe(takeUntil...) definido arriba
      .subscribe({
        next: (registros) => {
          console.log('Registros cargados (con filtros si aplican):', registros);
          this.cargando = false; // Indica que la carga de registros terminó
        },
        error: (error) => {
          console.error('Error al obtener los registros:', error);
          this.cargando = false; // Indica que la carga terminó, incluso si hubo un error
        }
      });
  }

  private resetNuevoRegistro() {
    this.nuevoRegistro = {
      conductor: '',
      transporte: '',
      tipo_carga: '',
      turno: '',
      vuelta: '',
      local: '',
      gestion: '',
      estado: 'Pendiente',
      fecha: ''
    };
  }

  applyFilters() {
    console.log('Aplicando filtros:', this.filterCriteria);
    this.cargando = true; // Mostrar indicador de carga al aplicar filtros
    this.refreshData$.next(); // Disparar la recarga de datos con los nuevos filtros
  }

  resetFilters() {
    console.log('Reiniciando filtros.');
    // Restablecer los criterios de filtro a su estado inicial
    this.filterCriteria = {
      conductor: '',
      fecha: '',
      turno: ''
    };
    this.cargando = true; // Mostrar indicador de carga
    this.refreshData$.next(); // Disparar la recarga de datos sin filtros
  }
}