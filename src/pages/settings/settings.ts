import { Component } from '@angular/core';
import { AlertController, NavController, ToastController } from 'ionic-angular';
import { UserData } from '../../providers/user-data';


@Component({
  selector: 'app-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  settings: any;
  isDirty = false;

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController, public userData: UserData) {
    userData.getUserSettings().subscribe((data) => {
      this.settings = data;
    });
  }

  onSettingChange() {
    this.isDirty = true;
  }
  // If the user enters text in the support question and then navigates
  // without submitting first, ask if they meant to leave the page
  ionViewCanLeave() {
    // If the support message is empty we should just navigate
    if (this.isDirty) {
      this.userData.updateUserSettings(this.settings);
    }
  }
}
