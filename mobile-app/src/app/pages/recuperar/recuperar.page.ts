import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-recuperar',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './recuperar.page.html',
  styleUrls: ['./recuperar.page.scss']
})
export class RecuperarPage {
  email = '';
  errorMessage = '';
  loading = false;

  constructor(
    private readonly auth: AuthService,
    private readonly toastCtrl: ToastController,
    private readonly router: Router
  ) {}

  async onRecover(): Promise<void> {
    if (!this.email) {
      this.errorMessage = 'Por favor ingresa tu correo';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    try {
      await this.auth.resetPassword(this.email);
      const t = await this.toastCtrl.create({
        message: 'Enlace enviado ✔️',
        color: 'success',
        duration: 2000
      });
      await t.present();
      this.router.navigate(['/login']);
    } catch (err: any) {
      this.errorMessage = err.message ?? 'Error al enviar enlace';
    } finally {
      this.loading = false;
    }
  }
}
