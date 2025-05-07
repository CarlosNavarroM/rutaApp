import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseDatabaseService } from '../../services/firebase-database.service';
import { Observable, BehaviorSubject, switchMap, forkJoin, of, map } from 'rxjs';
import { Usuario, Conductor, Transporte, TipoCarga, Turno, Vuelta, Local, Gestion, Estado } from '../../models/models';

@Component({
  selector: 'app-add-route',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-route.component.html',
  styleUrls: ['./add-route.component.scss']
})
export class AddRouteComponent implements OnInit {
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
  cargando: boolean = true;

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
    estado: '',
    fecha: ''
  };

  constructor(private dbService: FirebaseDatabaseService) { }

  ngOnInit() {
    this.conductores$ = this.dbService.readCollectionData('CONDUCTOR');
    this.transportes$ = this.dbService.readCollectionData('TRANSPORTE');
    this.tiposCarga$ = this.dbService.readCollectionData('TIPO_CARGA');
    this.turnos$ = this.dbService.readCollectionData('TURNO');
    this.vueltas$ = this.dbService.readCollectionData('VUELTA');
    this.locales$ = this.dbService.readCollectionData('LOCAL');
    this.gestiones$ = this.dbService.readCollectionData('GESTION');
    this.estados$ = this.dbService.readCollectionData('ESTADO');

    // Suscripción para los datos del formulario
    forkJoin([
      this.conductores$,
      this.transportes$,
      this.tiposCarga$,
      this.turnos$,
      this.vueltas$,
      this.locales$,
      this.gestiones$,
      this.estados$
    ]).subscribe({
      next: (/* No necesitamos los datos aquí, solo saber que cargaron */) => {
        // Los datos del formulario se cargaron
      },
      error: (error) => {
        console.error('Error al obtener los datos del formulario:', error);
        this.cargando = false; // Importante marcar cargando como falso en caso de error
      }
    });

    // La suscripción a registros$ ahora solo actualiza el estado de carga
    this.registros$.subscribe({
      next: (data) => {
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener los registros:', error);
        this.cargando = false;
      }
    });
  }

  agregarRegistro() {
    const nuevo = {
      ...this.nuevoRegistro,
      fecha: new Date(this.nuevoRegistro.fecha)
    };

    console.log('Datos que se enviarán a writeData:', nuevo);

    this.dbService.writeData('REGISTRO_DESPACHO', nuevo).subscribe({
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
    this.dbService.deleteData('REGISTRO_DESPACHO', id).subscribe({
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