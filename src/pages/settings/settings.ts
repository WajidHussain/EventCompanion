import { Component } from '@angular/core';
import { AlertController, NavController, ToastController } from 'ionic-angular';
import { UserData } from '../../providers/user-data';
import { Helper } from '../../providers/helper';


@Component({
  selector: 'app-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  settings: any;
  isDirty = false;
  isDisabled = true;

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController, public userData: UserData, public helper: Helper) {
    userData.getUserSettings().subscribe((data) => {
      this.settings = data;
    });
    if (this.helper.isUserSignedIn()) {
      this.isDisabled = false;
    } else {
      this.toastCtrl.create({
        message: 'Please sign in to change settings..',
        duration: 2000
      }).present();
    }
  }

  onSettingChange() {
    this.isDirty = true;
  }
  
  ionViewCanLeave() {
    // If the support message is empty we should just navigate
    if (this.isDirty) {
      this.userData.updateUserSettings(this.settings);
    }
  }
}
