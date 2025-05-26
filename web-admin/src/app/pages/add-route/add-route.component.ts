import { Component, OnInit, OnDestroy, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseDatabaseService } from '../../services/firebase-database.service';
import { orderBy, where, QueryConstraint } from 'firebase/firestore';
import { Observable, forkJoin, map, Subject, takeUntil, from, take, finalize, of, EMPTY, catchError } from 'rxjs';

import { Usuario, Conductor, Transporte, TipoCarga, Turno, Vuelta, Local, Gestion, Estado } from '../../models/models';

interface RegistroDespacho {
  id: string;
  conductor: string;
  transporte: string;
  tipo_carga: string;
  turno: string;
  vuelta: string;
  local: string;
  gestion: string;
  estado: string;
  fecha: Date | string; // Mantenido como Date para manejo correcto
}

interface NuevoRegistroForm {
  conductor: string;
  transporte: string;
  tipo_carga: string;
  turno: string;
  vuelta: string;
  local: string;
  gestion: string;
  estado: string;
  fecha: string; // String del input datetime-local
}

@Component({
  selector: 'app-add-route',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-route.component.html',
  styleUrls: ['./add-route.component.scss']
})
export class AddRouteComponent implements OnInit, OnDestroy {

  // ... (otros trackBy, destroy$, filterCriteria, observables, etc. se mantienen igual) ...
  trackByNombre(index: number, item: { nombre: string }): string {
    return item.nombre;
  }
  
  trackById(index: number, item: RegistroDespacho): string {
    return item.id;
  }
  
  trackByPatente(index: number, item: { patente: string }): string {
    return item.patente;
  }

  trackByLocal(index: number, item: { local: string }): string {
    return item.local;
  }

  private readonly destroy$ = new Subject<void>();

  filterCriteria = {
    conductor: '',
    fecha: '',
    turno: ''
  };

  registros$: Observable<RegistroDespacho[]> = of([]); 
  cargando: boolean = true;

  conductores$!: Observable<Conductor[]>;
  transportes$!: Observable<Transporte[]>;
  tiposCarga$!: Observable<TipoCarga[]>;
  turnos$!: Observable<Turno[]>;
  vueltas$!: Observable<Vuelta[]>;
  locales$!: Observable<Local[]>;
  gestiones$!: Observable<Gestion[]>;
  estados$!: Observable<Estado[]>;


  nuevoRegistro: NuevoRegistroForm = {
    conductor: '',
    transporte: '',
    tipo_carga: '',
    turno: '',
    vuelta: '',
    local: '',
    gestion: '',
    estado: 'Pendiente',
    fecha: '' // Inicialmente vacío
  };

  constructor(private readonly dbService: FirebaseDatabaseService, private readonly appRef: ApplicationRef) {
    console.log('AddRouteComponent: Constructor inicializado.');
  }

  ngOnInit(): void {
    // ... (tu ngOnInit se mantiene igual) ...
    console.log('AddRouteComponent: ngOnInit ejecutado. Iniciando carga de opciones de formulario y registros.');
  
    this.cargando = true; 

    forkJoin([
      from(this.dbService.readCollection('CONDUCTOR')).pipe(map(qs => qs.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conductor))), take(1)),
      from(this.dbService.readCollection('TRANSPORTE')).pipe(map(qs => qs.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transporte))), take(1)),
      from(this.dbService.readCollection('TIPO_CARGA')).pipe(map(qs => qs.docs.map(doc => ({ id: doc.id, ...doc.data() } as TipoCarga))), take(1)),
      from(this.dbService.readCollection('TURNO')).pipe(map(qs => qs.docs.map(doc => ({ id: doc.id, ...doc.data() } as Turno))), take(1)),
      from(this.dbService.readCollection('VUELTA')).pipe(map(qs => qs.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vuelta))), take(1)),
      from(this.dbService.readCollection('LOCAL')).pipe(map(qs => qs.docs.map(doc => ({ id: doc.id, ...doc.data() } as Local))), take(1)),
      from(this.dbService.readCollection('GESTION')).pipe(map(qs => qs.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gestion))), take(1)),
      from(this.dbService.readCollection('ESTADO')).pipe(map(qs => qs.docs.map(doc => ({ id: doc.id, ...doc.data() } as Estado))), take(1)),
      
      this.getAndMapRegistros().pipe(take(1)) 
    ]).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Página: Error crítico al cargar datos iniciales (opciones de formulario o registros):', error);
        this.cargando = false; 
        return EMPTY; 
      })
    )
    .subscribe({
      next: ([conductores, transportes, tiposCarga, turnos, vueltas, locales, gestiones, estados, registros]) => {
        this.conductores$ = of(conductores);
        this.transportes$ = of(transportes);
        this.tiposCarga$ = of(tiposCarga);
        this.turnos$ = of(turnos);
        this.vueltas$ = of(vueltas);
        this.locales$ = of(locales);
        this.gestiones$ = of(gestiones);
        this.estados$ = of(estados);
        this.registros$ = of(registros); 

        console.log('Página: Todos los datos iniciales (opciones y registros) cargados exitosamente.');
        this.cargando = false; 
      },
      error: (error) => {
        console.error('Página: Fallback de error en suscripción de datos iniciales:', error);
        this.cargando = false; 
      }
    });
  }

  ngOnDestroy() {
    // ... (tu ngOnDestroy se mantiene igual) ...
    this.destroy$.next();
    this.destroy$.complete();
    console.log('AddRouteComponent: Componente destruido. Suscripciones RxJS canceladas.');
  }

  private buildQueryConstraints(): QueryConstraint[] {
    // ... (tu buildQueryConstraints se mantiene igual) ...
    const queryConstraints: QueryConstraint[] = [];
    queryConstraints.push(orderBy('fecha', 'desc'));

    if (this.filterCriteria.conductor) {
      console.log(`Filtro: Añadiendo filtro por conductor: ${this.filterCriteria.conductor}`);
      queryConstraints.push(where('conductor', '==', this.filterCriteria.conductor));
    }
    if (this.filterCriteria.turno) {
      console.log(`Filtro: Añadiendo filtro por turno: ${this.filterCriteria.turno}`);
      queryConstraints.push(where('turno', '==', this.filterCriteria.turno));
    }
    if (this.filterCriteria.fecha) {
      const selectedDate = new Date(this.filterCriteria.fecha);
      if (isNaN(selectedDate.getTime())) {
        console.warn('Filtro: Fecha de filtro ingresada es inválida. Saltando filtro de fecha.');
      } else {
        console.log(`Filtro: Añadiendo filtro por fecha: ${this.filterCriteria.fecha}`);
        
        const startOfDay = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0, 0));
        const endOfDay = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59, 999));

        console.log(`Filtro: Rango de fecha UTC para la consulta - Inicio: ${startOfDay.toISOString()}, Fin: ${endOfDay.toISOString()}`);

        queryConstraints.push(where('fecha', '>=', startOfDay));
        queryConstraints.push(where('fecha', '<=', endOfDay));
      }
    }
    return queryConstraints;
  }

  private getAndMapRegistros(): Observable<RegistroDespacho[]> {
    // ... (tu getAndMapRegistros se mantiene igual, la conversión de Timestamp a Date es correcta aquí) ...
    console.log('Registros: Invocando getAndMapRegistros para obtener datos.');
    const queryConstraints = this.buildQueryConstraints();

    return from(this.dbService.readCollection('REGISTRO_DESPACHO', ...queryConstraints)).pipe(
      map(querySnapshot => {
        if (!querySnapshot || !querySnapshot.docs) {
          console.warn('Registros: QuerySnapshot o docs es nulo/indefinido durante getAndMapRegistros. Retornando array vacío.');
          return [];
        }
        const mappedData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RegistroDespacho));
        console.log('Registros: Datos obtenidos y mapeados en getAndMapRegistros:', mappedData);
        return mappedData;
      }),
      map((registros: RegistroDespacho[]) => {
        console.log('Registros: Iniciando conversión de fechas en getAndMapRegistros. Datos antes de conversión:', registros);
        return registros.map((registro: RegistroDespacho) => {
          if ((registro.fecha as any)?.toDate) {
            registro.fecha = (registro.fecha as any).toDate();
          } else if (typeof registro.fecha === 'string' && !isNaN(new Date(registro.fecha).getTime())) {
            registro.fecha = new Date(registro.fecha);
          } else if (!(registro.fecha instanceof Date)) {
            console.warn(`Registros: Fecha inválida para registro ID ${registro.id} en getAndMapRegistros. Estableciendo fecha por defecto. Valor original:`, registro.fecha);
            registro.fecha = new Date(0); 
          }
          return registro;
        });
      }),
      catchError(error => {
        console.error('Registros: Error en getAndMapRegistros durante la lectura/mapeo:', error);
        return of([]); 
      })
    );
  }

  async agregarRegistro() {
    let fechaParaGuardar: Date;

    if (this.nuevoRegistro.fecha && this.nuevoRegistro.fecha.trim() !== '') {
      // Directamente parsea la cadena de fecha y hora local.
      // new Date("YYYY-MM-DDTHH:mm") crea un objeto Date que representa esa hora local.
      fechaParaGuardar = new Date(this.nuevoRegistro.fecha);
    } else {
      // Fallback si el input de fecha está vacío (aunque 'required' debería prevenirlo)
      // O si quieres una fecha por defecto si no se provee.
      // Considera si esto es deseable o si deberías mostrar un error.
      console.warn('Operación: No se proporcionó fecha, usando fecha y hora actual.');
      fechaParaGuardar = new Date(); // Fecha y hora local actual
    }

    // Validar si la fecha es válida después del intento de parseo
    if (isNaN(fechaParaGuardar.getTime())) {
      console.error('Operación: La fecha y hora proporcionadas resultaron en una fecha inválida:', this.nuevoRegistro.fecha);
      this.cargando = false; // Asegúrate de resetear el estado de carga
      // Podrías mostrar un mensaje al usuario aquí.
      alert('La fecha y hora ingresada no es válida. Por favor, corrígela.');
      return; // Detener la ejecución si la fecha es inválida
    }

    const nuevo = {
      ...this.nuevoRegistro,
      fecha: fechaParaGuardar // Guardar el objeto Date que representa la hora local seleccionada
    };

    console.log('Operación: Preparando nuevo registro para agregar (con fecha ajustada):', nuevo);
    this.cargando = true;

    try {
      await this.dbService.createDocument('REGISTRO_DESPACHO', nuevo);
      console.log('Operación: Nuevo registro agregado exitosamente.');
      this.resetNuevoRegistro();
      console.log('Operación: Formulario de nuevo registro reseteado.');
      this.reloadRecords();
    } catch (error) {
      console.error('Operación: Error al agregar el registro:', error);
    } finally {
      this.cargando = false;
    }
  }

  confirmarEliminar(id: string) {
    // ... (tu confirmarEliminar se mantiene igual) ...
    console.log(`Operación: Solicitud de confirmación para eliminar registro ID: ${id}`);
    const confirmado = window.confirm('¿Estás seguro que quieres eliminar este registro? Esta acción no se puede deshacer.'); 
    if (confirmado) {
      console.log(`Operación: Confirmación de eliminación aceptada para ID: ${id}`);
      this.eliminarRegistro(id);
    } else {
      console.log(`Operación: Eliminación cancelada por el usuario para ID: ${id}`);
    }
  }

  async eliminarRegistro(id: string) {
    // ... (tu eliminarRegistro se mantiene igual) ...
    console.log(`Operación: Iniciando eliminación de registro con ID: ${id}`);
    this.cargando = true;

    try {
      await this.dbService.deleteDocument('REGISTRO_DESPACHO', id);
      console.log(`Operación: Registro ${id} eliminado exitosamente.`);
      this.reloadRecords(); 
    } catch (error) {
      console.error('Operación: Error al eliminar el registro:', error);
    } finally {
      this.cargando = false; 
    }
  }

  private reloadRecords(): void {
    // ... (tu reloadRecords se mantiene igual) ...
    console.log('Recarga: Iniciando recarga manual de registros.');
    this.cargando = true; 
    this.getAndMapRegistros().pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (records) => {
        this.registros$ = of(records);
        console.log('Recarga: Registros recargados exitosamente.');
        this.cargando = false; 
      },
      error: (err) => {
        console.error('Recarga: Error durante la recarga manual de registros:', err);
        this.registros$ = of([]); 
        this.cargando = false; 
      }
    });
  }

  private resetNuevoRegistro() {
    // ... (tu resetNuevoRegistro se mantiene igual) ...
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
    // ... (tu applyFilters se mantiene igual) ...
    console.log('Filtro: Aplicando filtros. Criterios actuales:', this.filterCriteria);
    this.reloadRecords();
  }

  resetFilters() {
    // ... (tu resetFilters se mantiene igual) ...
    console.log('Filtro: Reiniciando filtros.');
    this.filterCriteria = {
      conductor: '',
      fecha: '',
      turno: ''
    };
    this.reloadRecords(); 
    console.log('Filtro: Disparando recarga de datos sin filtros.');
  }
}