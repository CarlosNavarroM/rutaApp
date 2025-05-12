import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router, NavigationStart, NavigationEnd, NavigationError, Event } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(private readonly router: Router) {
    console.log('AppComponent: constructor called');
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        console.log('RouterEvent: NavigationStart ->', event.url);
      } else if (event instanceof NavigationEnd) {
        console.log('RouterEvent: NavigationEnd ->', event.url);
      } else if (event instanceof NavigationError) {
        console.error('RouterEvent: NavigationError', event.error);
      }
    });
  }
}
