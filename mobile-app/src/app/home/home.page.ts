// src/app/home/home.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  LoadingController,
  ToastController,
  AlertController
} from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { ConductorService } from '../services/conductor.service';
import { DispatchService } from '../services/dispatch.service';
import { Conductor, RegistroDespacho } from '../models/models';
import { User as FirebaseUser } from 'firebase/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  public despachos: RegistroDespacho[] = [];
  public displayedDespachos: RegistroDespacho[] = [];
  public loading = false;
  public error = '';
  public selectedSegment: 'pendientes' | 'completados' | 'rechazados' = 'pendientes';
  private conductorNombre = '';

  constructor(
    private readonly authService: AuthService,
    private readonly conductorService: ConductorService,
    private readonly dispatchService: DispatchService,
    private readonly loadingCtrl: LoadingController,
    private readonly toastCtrl: ToastController,
    private readonly alertCtrl: AlertController
  ) {}

  ngOnInit(): void {
    this.onSegmentChanged();
    this.loadDespachos();
  }

  private async loadDespachos(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      const firebaseUser: FirebaseUser | null = await this.authService.getCurrentUser();
      if (!firebaseUser) throw new Error('Usuario no autenticado');

      const profile = await firstValueFrom(
        this.conductorService.getById(firebaseUser.uid)
      ) as Conductor;
      this.conductorNombre = profile.nombre;

      this.despachos = await firstValueFrom(
        this.dispatchService.getByConductorNombre(this.conductorNombre)
      );
      this.onSegmentChanged();

    } catch (err: any) {
      console.error(err);
      this.error = err.message ?? 'Error inesperado';
      await this.showToast(this.error, 'danger');
    } finally {
      this.loading = false;
    }
  }

  public onSegmentChanged(): void {
    if (this.selectedSegment === 'pendientes') {
      this.displayedDespachos = this.despachos.filter(d => d.estado === 'Pendiente');
    } else if (this.selectedSegment === 'completados') {
      this.displayedDespachos = this.despachos.filter(d => d.estado === 'Entregado');
    } else {
      this.displayedDespachos = this.despachos.filter(d => d.estado === 'Rechazado');
    }
  }

  public cardClass(estado: string): { [key: string]: boolean } {
    return {
      'pending-card': estado === 'Pendiente',
      'completed-card': estado === 'Entregado',
      'error-card': estado === 'Rechazado'
    };
  }

  public badgeColor(estado: string): 'primary' | 'success' | 'warning' {
    if (estado === 'Pendiente') return 'primary';
    if (estado === 'Entregado') return 'success';
    return 'warning';
  }

  public async entregar(id?: string): Promise<void> {
    if (!id) return;
    try {
      await this.dispatchService.marcarEntregado(id);
      await this.showToast('✅ Entregado', 'success');
      await this.loadDespachos();
    } catch (err: any) {
      console.error(err);
      await this.showToast(err.message ?? 'Error al entregar', 'danger');
    }
  }

  public async rechazar(id?: string): Promise<void> {
    if (!id) return;

    const alert = await this.alertCtrl.create({
      header: 'Motivo de rechazo',
      inputs: [{ name: 'razon', type: 'text', placeholder: '¿Por qué?' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Rechazar', handler: data => data.razon }
      ]
    });
    await alert.present();
    const { data, role } = await alert.onDidDismiss();
    if (role === 'cancel') return;

    try {
      await this.dispatchService.marcarRechazado(id, data.values.razon);
      await this.showToast('❌ Rechazado', 'warning');
      await this.loadDespachos();
    } catch (err: any) {
      console.error(err);
      await this.showToast(err.message ?? 'Error al rechazar', 'danger');
    }
  }

  public async showMapAlert(address: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Ruta',
      message: address,
      buttons: ['OK']
    });
    await alert.present();
  }

  private async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({ message, duration: 1500, color });
    await toast.present();
  }
}