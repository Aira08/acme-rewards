import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { PartnerConnectService } from './core/partner-connect/partner-connect.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private pc = inject(PartnerConnectService);
  
  constructor() {
    this.pc.init();
  }
}
