import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButton
 } from '@ionic/angular';
import { PartnerConnectService } from '../../core/partner-connect/partner-connect.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    IonButton, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    CommonModule, 
    FormsModule
  ]
})
export class HomePage implements OnInit {
  pc = inject(PartnerConnectService);

  //Fake Data
  points = 3400;
  tier = 'Gold member';
  bill = {
    title: 'Membership Renewal',
    amount: 499,
    due: new Date(2026, 9, 31)
  };

  // pay() {
  //   this.pc.payWithAsensoPay(this.bill.amount, this.bill.title);
  // }

  constructor() { }

  ngOnInit() {
  }

}
