import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseDatabaseService } from '../../services/firebase-database.service';
import { Despacho, Conductor, Transporte, TipoCarga, Estado, Local } from '../../models/models';
import { Timestamp } from 'firebase/firestore';
import { forkJoin } from 'rxjs';

interface DespachoDetalle {
  id: string;
  fecha: Timestamp;
  estado: string;
  conductor: string;
  rutConductor: string;
  patente: string;
  tipoCarga: string;
  local: string;
}

type FiltroVista = 'total' | 'semanal' | 'mensual';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private readonly db = inject(FirebaseDatabaseService);

  total = 0;
  semanal = 0;
  mensual = 0;

  todos: DespachoDetalle[] = [];
  vista: DespachoDetalle[] = [];

  filtroActual: FiltroVista = 'total';
  cantidadVisible = 20;

  ngOnInit(): void {
    forkJoin({
      despachos: this.db.getDespachos(),
      conductores: this.db.getConductores(),
      transportes: this.db.getTransportes(),
      tiposCarga: this.db.getTiposCarga(),
      estados: this.db.getEstados(),
      locales: this.db.getLocales()
    }).subscribe(({ despachos, conductores, transportes, tiposCarga, estados, locales }) => {
      const detalles: DespachoDetalle[] = despachos
        .filter(d => d.fecha && d.fecha.toDate)
        .map(d => {
          const conductor = conductores.find(c => c.id === d.conductor);
          const transporte = transportes.find(t => t.id === d.transporte);
          const tipo = tiposCarga.find(t => t.id === d.tipo_carga);
          const estado = estados.find(e => e.id === d.estado);
          const local = locales.find(l => l.id === d.local);

          return {
            id: d.id || '',
            fecha: d.fecha,
            estado: estado?.nombre || d.estado,
            conductor: conductor?.nombre || d.conductor,
            rutConductor: conductor?.rut || '',
            patente: transporte?.patente || '',
            tipoCarga: tipo?.nombre || '',
            local: local?.local || ''
          };
        });

      this.todos = detalles.sort((a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime());

      const ahora = new Date();
      const haceUnaSemana = new Date(ahora);
      haceUnaSemana.setDate(ahora.getDate() - 7);

      const haceUnMes = new Date(ahora);
      haceUnMes.setMonth(ahora.getMonth() - 1);

      this.total = detalles.length;
      this.semanal = detalles.filter(d => d.fecha.toDate() >= haceUnaSemana).length;
      this.mensual = detalles.filter(d => d.fecha.toDate() >= haceUnMes).length;

      this.filtrarVista('total');
    });
  }

  filtrarVista(tipo: FiltroVista): void {
    this.filtroActual = tipo;
    this.cantidadVisible = 20;

    const ahora = new Date();
    const haceUnaSemana = new Date(ahora);
    haceUnaSemana.setDate(ahora.getDate() - 7);

    const haceUnMes = new Date(ahora);
    haceUnMes.setMonth(ahora.getMonth() - 1);

    if (tipo === 'total') {
      this.vista = this.todos.slice();
    } else if (tipo === 'semanal') {
      this.vista = this.todos.filter(d => d.fecha.toDate() >= haceUnaSemana);
    } else if (tipo === 'mensual') {
      this.vista = this.todos.filter(d => d.fecha.toDate() >= haceUnMes);
    }
  }

  mostrarMas(): void {
    this.cantidadVisible += 20;
  }

  get registrosVisibles(): DespachoDetalle[] {
    return this.vista.slice(0, this.cantidadVisible);
  }
}
