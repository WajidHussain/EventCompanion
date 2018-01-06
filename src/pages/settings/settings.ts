import { Component } from '@angular/core';
import { AlertController, NavController, ToastController, LoadingController } from 'ionic-angular';
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
  localMasjids = [];
  notificationMasjids = [];

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController, public userData: UserData, public helper: Helper, public loadingCtrl: LoadingController) {
    userData.getUserSettings().subscribe((data) => {
      if (data) {
        this.settings = data.settings ? Object.assign({}, data.settings) : {};
        this.setModels();
        // idea - homemasjid will always have notifications enabled by default. user cannot opt in.
        this.localMasjids = data.masjids; // all masjids
        if (this.settings && this.settings.homeMasjid) {
          this.removeHomeMasjidFromLocals();
        }
      }
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

  removeHomeMasjidFromLocals() {
    let copy = this.localMasjids.slice();
    let homeMasjidIdx = this.localMasjids.findIndex((value: any) => {
      return value.id === this.settings.homeMasjid;
    });
    copy.splice(homeMasjidIdx, 1);
    this.notificationMasjids = copy;
  }

  onHomeMasjidChange() {
    this.removeHomeMasjidFromLocals();
    this.onSettingChange();
    // resetting these for now..
    this.settings.otherMasjidEvents = [];
    this.settings.otherMasjidAnnouncements = [];
  }

  setModels() {
    if (!this.settings || !this.settings.homeMasjid) {
      this.settings.homeMasjid = "";
    }
    if (!this.settings || !this.settings.otherMasjidEvents) {
      this.settings.otherMasjidEvents = "";
    }
    if (!this.settings || !this.settings.otherMasjidAnnouncements) {
      this.settings.otherMasjidAnnouncements = "";
    }
  }

  onSettingChange() {
    this.isDirty = true;
  }

  submit() {
    // If the support message is empty we should just navigate
    if (this.isDirty) {
      let loading = this.loadingCtrl.create({
        content: "Updating your settings.."
      });
      loading.present();
      if (this.settings.otherMasjidAnnouncements.length == 0 && this.settings.otherMasjidEvents.length == 0) {
        this.settings.otherMasjidNotify = false;
      }
      if (!this.settings.homeMasjid) {
        this.settings.homeMasjidNotify = false;
      }
      this.userData.updateUserSettings(this.settings).then(() => {
        loading.dismiss();
        this.presentToast('Settings saved!');
        this.isDirty = false;
        this.navCtrl.pop();
      }, () => {
        loading.dismiss();
        this.presentToast('There was a problem reaching server. Please try again!');
      });
      ;
    }
  }

  presentToast(message: string, duration = 2000) {
    this.toastCtrl.create({
      message: message,
      duration: duration
    }).present();
  }

  // ionViewCanLeave() {
  // }
}
