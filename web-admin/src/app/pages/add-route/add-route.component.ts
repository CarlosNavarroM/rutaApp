import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseDatabaseService } from '../../services/firebase-database.service';
import { Observable, BehaviorSubject, switchMap } from 'rxjs';

@Component({
  selector: 'app-add-route',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-route.component.html',
  styleUrls: ['./add-route.component.scss']
})
export class AddRouteComponent implements OnInit { // <--- Asegúrate de que la CLASE tenga la palabra 'export' aquí
  private refreshData$ = new BehaviorSubject<void>(undefined);
  registros$: Observable<any[]> = this.refreshData$.pipe(
    switchMap(() => this.dbService.readCollectionData('REGISTRO_DESPACHO'))
  );
  cargando: boolean = true;

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

  constructor(private dbService: FirebaseDatabaseService) {}

  ngOnInit() {
    this.registros$.subscribe({
      next: (data) => {
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener los datos:', error);
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