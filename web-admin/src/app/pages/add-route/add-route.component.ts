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
  fecha: Date | string; // Cambiado a Date para manejar correctamente la fecha
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
  fecha: string;
}

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
    fecha: ''
  };

  constructor(private readonly dbService: FirebaseDatabaseService, private readonly appRef: ApplicationRef) {
    console.log('AddRouteComponent: Constructor inicializado.');
  }

  ngOnInit(): void {
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
    this.destroy$.next();
    this.destroy$.complete();
    console.log('AddRouteComponent: Componente destruido. Suscripciones RxJS canceladas.');
  }

  private buildQueryConstraints(): QueryConstraint[] {
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
      // Creas la fecha seleccionada.
      const selectedDate = new Date(this.filterCriteria.fecha);
      if (isNaN(selectedDate.getTime())) {
        console.warn('Filtro: Fecha de filtro ingresada es inválida. Saltando filtro de fecha.');
      } else {
        console.log(`Filtro: Añadiendo filtro por fecha: ${this.filterCriteria.fecha}`);
        
        // Calcula el inicio y fin del día en UTC a partir de los componentes de la fecha seleccionada.
        // Esto asegura que, sin importar la zona horaria del cliente, se construyan las mismas horas UTC (00:00:00 y 23:59:59.999).
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
            // Convertir Timestamp de Firestore a Date de JS
            registro.fecha = (registro.fecha as any).toDate();
          } else if (typeof registro.fecha === 'string' && !isNaN(new Date(registro.fecha).getTime())) {
            // Si es un string válido, convertir a Date (esto es más para datos legacy o de otro origen)
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
    const nuevo = {
      ...this.nuevoRegistro,
      // Al guardar, también creamos la fecha usando Date.UTC para asegurar que se almacene consistentemente
      // Esto evita el problema de la zona horaria al guardar.
      fecha: this.nuevoRegistro.fecha 
        ? new Date(Date.UTC(
            new Date(this.nuevoRegistro.fecha).getFullYear(),
            new Date(this.nuevoRegistro.fecha).getMonth(),
            new Date(this.nuevoRegistro.fecha).getDate()
          ))
        : new Date() // Si no hay fecha seleccionada, usa la fecha/hora actual local
    };

    console.log('Operación: Preparando nuevo registro para agregar:', nuevo);
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
    console.log('Filtro: Aplicando filtros. Criterios actuales:', this.filterCriteria);
    this.reloadRecords(); 
  }

  resetFilters() {
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