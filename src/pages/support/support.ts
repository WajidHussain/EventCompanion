import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserData } from '../../providers/user-data';
import { AlertController, NavController, ToastController } from 'ionic-angular';


@Component({
  selector: 'app-support',
  templateUrl: 'support.html'
})
export class SupportPage {

  submitted: boolean = false;
  supportMessage: string;

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController, public userData: UserData
  ) {

  }

  submit(form: NgForm) {

    if (form.valid) {
      this.userData.updateSupportQuery(this.supportMessage).then(() => {
        let toast = this.toastCtrl.create({
          message: 'Your support request has been sent.',
          duration: 3000
        });
        toast.present();
        this.navCtrl.popToRoot();
      }).catch(() => {
        let toast = this.toastCtrl.create({
          message: 'There was a problem sending the request, please try again.',
          duration: 3000
        });
        toast.present();
      });
    }
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
