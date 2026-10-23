import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonSegment, 
  IonSegmentButton, 
  IonLabel, 
  IonIcon, 
  IonSpinner, 
  IonButton, 
  IonItem, 
  IonList
 } from '@ionic/angular';
import { PartnerConnectService } from '../../core/partner-connect/partner-connect.service';
import { SCOPE_LABELS } from '../../core/partner-connect/partner-connect.types';
import { addIcons } from 'ionicons';
import { checkmark, alertCircleOutline, openOutline } from 'ionicons/icons';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  imports: [
    IonList, 
    IonButton, 
    IonIcon, 
    IonLabel, 
    IonSegmentButton, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    CommonModule, 
    FormsModule, 
    IonSegment, 
    IonSpinner, 
    IonItem
  ]
})
export class SettingsPage {
  pc = inject(PartnerConnectService);
  labels = SCOPE_LABELS;

  constructor() {
    addIcons({ checkmark, alertCircleOutline, openOutline });
   }

  ngOnInit() {
  }

}
