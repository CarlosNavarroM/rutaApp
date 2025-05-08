import { Component, OnInit, OnDestroy } from '@angular/core'; // Importar OnDestroy
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseDatabaseService } from '../../services/firebase-database.service';
// Importar takeUntil
import { Observable, BehaviorSubject, switchMap, forkJoin, of, map, Subject, takeUntil } from 'rxjs';
import { Usuario, Conductor, Transporte, TipoCarga, Turno, Vuelta, Local, Gestion, Estado } from '../../models/models';

@Component({
  selector: 'app-add-route',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-route.component.html',
  styleUrls: ['./add-route.component.scss']
})
// Implementar OnDestroy
export class AddRouteComponent implements OnInit, OnDestroy {

  // Subject para gestionar la cancelación de suscripciones
  private destroy$ = new Subject<void>();

  private refreshData$ = new BehaviorSubject<void>(undefined);
  registros$: Observable<any[]> = this.refreshData$.pipe(
    switchMap(() => this.dbService.readCollectionData('REGISTRO_DESPACHO')),
    map((registros: any[]) => {
      return registros.sort((a: any, b: any) => {
        const dateA = a.fecha?.toDate ? a.fecha.toDate() : new Date(a.fecha);
        const dateB = b.fecha?.toDate ? b.fecha.toDate() : new Date(b.fecha);
        return dateB.getTime() - dateA.getTime(); // Orden descendente
      });
    })
  );
  cargando: boolean = true; // Considera refactorizar a cargandoRegistros y cargandoOpcionesForm si quieres más granularidad

  // Observables para las opciones del formulario (no necesitan takeUntil aquí porque no hay .subscribe() directo)
  conductores$: Observable<any[]> = of([]);
  transportes$: Observable<any[]> = of([]);
  tiposCarga$: Observable<any[]> = of([]);
  turnos$: Observable<any[]> = of([]);
  vueltas$: Observable<any[]> = of([]);
  locales$: Observable<any[]> = of([]);
  gestiones$: Observable<any[]> = of([]);
  estados$: Observable<any[]> = of([]);

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
    // Inicializar observables para las opciones del formulario (usados en forkJoin y el HTML con async pipe)
    this.conductores$ = this.dbService.readCollectionData('CONDUCTOR');
    this.transportes$ = this.dbService.readCollectionData('TRANSPORTE');
    this.tiposCarga$ = this.dbService.readCollectionData('TIPO_CARGA');
    this.turnos$ = this.dbService.readCollectionData('TURNO');
    this.vueltas$ = this.dbService.readCollectionData('VUELTA');
    this.locales$ = this.dbService.readCollectionData('LOCAL');
    this.gestiones$ = this.dbService.readCollectionData('GESTION');
    this.estados$ = this.dbService.readCollectionData('ESTADO');

    // Suscripción para saber cuándo se cargaron las opciones del formulario
    // Usamos takeUntil para cancelar esta suscripción al destruir el componente
    forkJoin([
      this.conductores$,
      this.transportes$,
      this.tiposCarga$,
      this.turnos$,
      this.vueltas$,
      this.locales$,
      this.gestiones$,
      this.estados$
    ]).pipe(takeUntil(this.destroy$)) // <- ¡Aquí aplicamos takeUntil!
    .subscribe({
      next: (/* No necesitamos los datos aquí, solo saber que cargaron */) => {
        // Los datos del formulario se cargaron
        // Puedes ajustar el flag de carga si usas cargandoOpcionesForm
      },
      error: (error) => {
        console.error('Error al obtener los datos del formulario:', error);
        this.cargando = false; // Importante marcar cargando como falso en caso de error
      }
    });

    // La suscripción a registros$ ahora solo actualiza el estado de carga
    // Aunque registros$ se usa con async pipe, esta suscripción manual necesita limpieza
    this.registros$.pipe(takeUntil(this.destroy$)) // <- ¡takeUntil aquí también!
    .subscribe({
      next: (data) => {
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener los registros:', error);
        this.cargando = false;
      }
    });
  }

  // Método del ciclo de vida que se ejecuta justo antes de que el componente sea destruido
  ngOnDestroy() {
    this.destroy$.next(); // Emitir un valor para indicar que se debe cancelar
    this.destroy$.complete(); // Completar el subject
    console.log('Componente AddRouteComponent destruido, suscripciones canceladas.');
  }

  agregarRegistro() {
    const nuevo = {
      ...this.nuevoRegistro,
      fecha: new Date(this.nuevoRegistro.fecha)
    };

    console.log('Datos que se enviarán a writeData:', nuevo);

    // Usamos takeUntil para cancelar esta suscripción si la navegación ocurre antes de completarse
    this.dbService.writeData('REGISTRO_DESPACHO', nuevo).pipe(takeUntil(this.destroy$)) // <- ¡takeUntil aquí!
    .subscribe({
      next: (docRef) => {
        console.log('Nuevo registro agregado con ID:', docRef.id);
        this.nuevoRegistro = {
          conductor: '',
          transporte: '',
          tipo_carga: '',
          turno: '',
          vuelta: '',
          local: '',
          gestion: '',
          estado: '',
          fecha: ''
        };
        this.refreshData$.next(); // Emitir para recargar la lista
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
    // Usamos takeUntil para cancelar esta suscripción si la navegación ocurre antes de completarse
    this.dbService.deleteData('REGISTRO_DESPACHO', id).pipe(takeUntil(this.destroy$)) // <- ¡takeUntil aquí!
    .subscribe({
      next: () => {
        console.log(`Registro ${id} eliminado`);
        this.refreshData$.next(); // Emitir para recargar la lista
      },
      error: (error) => {
        console.error('Error al eliminar el registro:', error);
      }
    });
  }
}