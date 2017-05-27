import { Component } from '@angular/core';

import { App, NavController, ModalController, ViewController } from 'ionic-angular';
import { SupportPage } from '../support/support';
import { SettingsPage } from '../settings/settings';
import { AboutPage } from '../about/about';
import { LoginPage } from '../login/login';

@Component({
  selector: 'home-popover',
  templateUrl: 'home-popover.html'
})

export class PopoverPage {

  constructor(
    public viewCtrl: ViewController,
    public navCtrl: NavController,
    public app: App,
    public modalCtrl: ModalController
  ) { }

  openSupport(pageName) {
    this.app.getRootNav().push(SupportPage);
    this.viewCtrl.dismiss();
  }

  openSettings(pageName) {
    this.app.getRootNav().push(SettingsPage);
    this.viewCtrl.dismiss();
  }

  openAbout(pageName) {
    this.app.getRootNav().push(AboutPage);
    this.viewCtrl.dismiss();
  }

  openLogin() {
    this.app.getRootNav().push(LoginPage);
    this.viewCtrl.dismiss();
  }

}