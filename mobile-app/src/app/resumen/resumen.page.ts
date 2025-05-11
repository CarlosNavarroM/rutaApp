// src/app/resumen/resumen.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';       // <-- IMPORTAR FormsModule
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { ConductorService } from '../services/conductor.service';
import { DispatchService } from '../services/dispatch.service';
import { RegistroDespacho, Conductor } from '../models/models';
import { User as FirebaseUser } from 'firebase/auth';

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],  // <-- AÑADIR FormsModule
  templateUrl: './resumen.page.html',
  styleUrls: ['./resumen.page.scss']
})
export class ResumenPage implements OnInit {
  public todos: RegistroDespacho[] = [];
  public mostrados: RegistroDespacho[] = [];
  public loading = false;
  public error = '';
  public selectedPeriod: 'semanal' | 'mensual' | 'total' = 'total';
  public count = 0;

  constructor(
    private auth: AuthService,
    private conductorSvc: ConductorService,
    private dispatchSvc: DispatchService
  ) {}

  async ngOnInit() {
    this.loading = true;
    try {
      const user = await this.auth.getCurrentUser();
      if (!user) throw new Error('No autenticado');

      const perfil = await firstValueFrom(
        this.conductorSvc.getById(user.uid)
      ) as Conductor;
      this.todos = await firstValueFrom(
        this.dispatchSvc.getByConductorNombre(perfil.nombre)
      );
      this.applyFilter();
    } catch (err: any) {
      console.error(err);
      this.error = err.message ?? 'Error inesperado';
    } finally {
      this.loading = false;
    }
  }

  public onPeriodChange(period: 'semanal' | 'mensual' | 'total') {
    this.selectedPeriod = period;
    this.applyFilter();
  }

  private applyFilter() {
    const now = new Date();
    if (this.selectedPeriod === 'semanal') {
      const weekAgo = new Date(now.getTime() - 7 * 24*60*60_000);
      this.mostrados = this.todos.filter(d => {
        const dts = d.fecha.toDate();
        return dts >= weekAgo && dts <= now;
      });
    } else if (this.selectedPeriod === 'mensual') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth()-1, now.getDate());
      this.mostrados = this.todos.filter(d => {
        const dts = d.fecha.toDate();
        return dts >= monthAgo && dts <= now;
      });
    } else {
      this.mostrados = [...this.todos];
    }
    this.count = this.mostrados.length;
  }
}
