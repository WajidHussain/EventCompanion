import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

import { AlertController, NavController, ToastController } from 'ionic-angular';


@Component({
  selector: 'app-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  submitted: boolean = false;
  supportMessage: string;

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController
  ) {

  }


  // If the user enters text in the support question and then navigates
  // without submitting first, ask if they meant to leave the page
  ionViewCanLeave(): boolean | Promise<boolean> {
    // If the support message is empty we should just navigate
    if (!this.supportMessage || this.supportMessage.trim().length === 0) {
      return true;
    }

    return new Promise((resolve: any, reject: any) => {
      let alert = this.alertCtrl.create({
        title: 'Leave this page?',
        message: 'Are you sure you want to leave this page? Your support message will not be submitted.'
      });
      alert.addButton({ text: 'Stay', handler: reject });
      alert.addButton({ text: 'Leave', role: 'cancel', handler: resolve });

      alert.present();
    });
  }
}
