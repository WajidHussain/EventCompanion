import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TabsPage } from '../pages/tabs/tabs';
import * as firebase from 'firebase/app';
import { Helper } from '../providers/helper';
import { Observable } from 'rxjs/Rx';


@Component({
  selector: 'event-companion',
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = TabsPage;

  constructor(platform: Platform, statusBar: StatusBar, private splashScreen: SplashScreen
    , private helper: Helper) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      Observable.timer(300).subscribe(() => {
        this.subscribe();
      });
    });
  }

  subscribe() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.helper.setUser(user);
      } else {
        // No user is signed in.
      }
      this.splashScreen.hide();
    });
  }
}
