import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { ConductorService } from '../services/conductor.service';
import { DispatchService } from '../services/dispatch.service';

import { Conductor, RegistroDespacho } from '../models/models';
import { User as FirebaseUser } from 'firebase/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  public despachos: RegistroDespacho[] = [];
  public loading = false;
  public error: string | null = null;
  private conductorNombre = '';

  constructor(
    private readonly authService: AuthService,
    private readonly conductorService: ConductorService,
    private readonly dispatchService: DispatchService,
    private readonly loadingCtrl: LoadingController,
    private readonly toastCtrl: ToastController
  ) {}

  ngOnInit(): void {
    this.loadDespachos();
  }

  private async loadDespachos(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // 1. Obtener usuario autenticado
      const firebaseUser: FirebaseUser | null = await this.authService.getCurrentUser();
      if (!firebaseUser) throw new Error('Usuario no autenticado');

      // 2. Obtener perfil de Conductor
      const profile = await firstValueFrom(
        this.conductorService.getById(firebaseUser.uid)
      ) as Conductor;
      if (!profile.nombre) throw new Error('Falta nombre del conductor');
      this.conductorNombre = profile.nombre;

      // 3. Cargar despachos
      this.despachos = await firstValueFrom(
        this.dispatchService.getByConductorNombre(this.conductorNombre)
      );

    } catch (err: any) {
      console.error(err);
      this.error = err.message ?? 'Error inesperado';
      await this.showToast(this.error ?? 'Error desconocido', 'danger');
    } finally {
      this.loading = false;
    }
  }

  public async entregar(id?: string): Promise<void> {
    if (!id) return;
    try {
      await this.dispatchService.marcarEntregado(id);
      await this.showToast('Despacho entregado', 'success');
      await this.loadDespachos();
    } catch (err: any) {
      console.error(err);
      await this.showToast(err.message ?? 'Error al entregar', 'danger');
    }
  }

  public async rechazar(id?: string): Promise<void> {
    if (!id) return;
    const motivo = await this.promptReason();
    if (!motivo) return;
    try {
      await this.dispatchService.marcarRechazado(id, motivo);
      await this.showToast('Despacho rechazado', 'warning');
      await this.loadDespachos();
    } catch (err: any) {
      console.error(err);
      await this.showToast(err.message ?? 'Error al rechazar', 'danger');
    }
  }

  private async promptReason(): Promise<string | null> {
    const alert = document.createElement('ion-alert');
    alert.header = 'Motivo de rechazo';
    alert.inputs = [{ name: 'razon', type: 'text', placeholder: 'Escribe el motivo…' }];
    alert.buttons = [
      { text: 'Cancelar', role: 'cancel' },
      { text: 'Aceptar', handler: (data: any) => data.razon }
    ];
    document.body.appendChild(alert);
    await alert.present();
    const { data, role } = await alert.onDidDismiss();
    return role === 'cancel' ? null : data.values.razon;
  }

  private async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color });
    await toast.present();
  }
}