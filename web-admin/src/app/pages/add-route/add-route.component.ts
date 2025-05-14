// Importaciones necesarias de Angular, módulos comunes y servicios
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationRef } from '@angular/core';
import { first } from 'rxjs/operators';
import { FirebaseDatabaseService } from '../../services/firebase-database.service';
import { orderBy, where, QueryConstraint } from 'firebase/firestore';
import { Observable, BehaviorSubject, switchMap, forkJoin, map, Subject, takeUntil, from } from 'rxjs';
import { Usuario, Conductor, Transporte, TipoCarga, Turno, Vuelta, Local, Gestion, Estado } from '../../models/models';

@Component({
  selector: 'app-add-route',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-route.component.html',
  styleUrls: ['./add-route.component.scss']
})
export class AddRouteComponent implements OnInit, OnDestroy {


trackByNombre(index: number, item: { nombre: string }): string {
    return item.nombre;
  }
  
  trackById(index: number, item: { id: string }): string {
    return item.id;
  }
  

  // Control de destrucción de suscripciones
  private destroy$ = new Subject<void>();

  // Disparador para recargar datos
  private refreshData$ = new BehaviorSubject<void>(undefined);

  // Criterios de filtro para búsqueda de registros
  filterCriteria = {
    conductor: '',
    fecha: '',
    turno: ''
  };

  // Observable que obtiene los registros filtrados desde Firestore
  registros$: Observable<any[]> = this.refreshData$.pipe(
    switchMap(() => {
      const queryConstraints: QueryConstraint[] = [];
      queryConstraints.push(orderBy('fecha', 'desc'));

      // Aplicar filtros si están definidos
      if (this.filterCriteria.conductor) {
        queryConstraints.push(where('conductor', '==', this.filterCriteria.conductor));
      }
      if (this.filterCriteria.turno) {
        queryConstraints.push(where('turno', '==', this.filterCriteria.turno));
      }
      if (this.filterCriteria.fecha) {
        const selectedDate = new Date(this.filterCriteria.fecha);
        const startOfDayUtc = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0, 0));
        const endOfDayUtc = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59, 999));
        queryConstraints.push(where('fecha', '>=', startOfDayUtc));
        queryConstraints.push(where('fecha', '<=', endOfDayUtc));
      }

      // Consultar Firestore con los filtros aplicados
      return from(this.dbService.readCollection('REGISTRO_DESPACHO', ...queryConstraints)).pipe(
        map(querySnapshot => querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      );
    }),
    // Convertir fechas a objetos Date
    map((registros: any[]) => {
      return registros.map((registro: any) => {
        registro.fecha = registro.fecha?.toDate ? registro.fecha.toDate() : (registro.fecha instanceof Date ? registro.fecha : new Date(registro.fecha));
        return registro;
      });
    }),
    takeUntil(this.destroy$)
  );

  // Indicador de carga
  cargando: boolean = true;

  // Observables para cargar opciones del formulario
  conductores$!: Observable<any[]>;
  transportes$!: Observable<any[]>;
  tiposCarga$!: Observable<any[]>;
  turnos$!: Observable<any[]>;
  vueltas$!: Observable<any[]>;
  locales$!: Observable<any[]>;
  gestiones$!: Observable<any[]>;
  estados$!: Observable<any[]>;

  // Modelo del nuevo registro a agregar
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

  constructor(private dbService: FirebaseDatabaseService, private appRef: ApplicationRef) {}

  ngOnInit(): void {
  // Ejecuta la lógica solo cuando la app esté estable (útil para SSR)
  this.appRef.isStable.pipe(first(stable => stable)).subscribe(() => {
    // Inicia solo después de estabilización
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

    this.subscribeToFormOptions();
    this.subscribeToRegistros();
  });
}
  ngOnDestroy() {
    // Cancelar suscripciones al destruir el componente
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Agrega un nuevo registro a Firestore
  agregarRegistro() {
    const nuevo = {
      ...this.nuevoRegistro,
      fecha: new Date(this.nuevoRegistro.fecha)
    };

    from(this.dbService.createDocument('REGISTRO_DESPACHO', nuevo)).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.resetNuevoRegistro();
          this.refreshData$.next();
        },
        error: (error) => {
          console.error('Error al agregar el registro:', error);
        }
      });
  }

  // Confirmación antes de eliminar un registro
  confirmarEliminar(id: string) {
    const confirmado = confirm('¿Estás seguro que quieres eliminar este registro?');
    if (confirmado) {
      this.eliminarRegistro(id);
    }
  }

  // Elimina un registro de Firestore
  eliminarRegistro(id: string) {
    from(this.dbService.deleteDocument('REGISTRO_DESPACHO', id)).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.refreshData$.next();
        },
        error: (error) => {
          console.error('Error al eliminar el registro:', error);
        }
      });
  }

  // Carga inicial de opciones del formulario
  private subscribeToFormOptions() {
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
          this.refreshData$.next();
        },
        error: (error) => {
          console.error('Error al obtener los datos de opciones:', error);
          this.cargando = false;
        }
      });
  }

  // Suscripción a los registros para mostrar en la vista
  private subscribeToRegistros() {
    this.registros$
      .subscribe({
        next: () => {
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al obtener los registros:', error);
          this.cargando = false;
        }
      });
  }

  // Reinicia el formulario de nuevo registro
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

  // Aplica los filtros definidos
  applyFilters() {
    this.cargando = true;
    this.refreshData$.next();
  }

  // Reinicia los filtros y recarga los datos
  resetFilters() {
    this.filterCriteria = {
      conductor: '',
      fecha: '',
      turno: ''
    };
    this.cargando = true;
    this.refreshData$.next();
  }
  
}
// Fin del componente