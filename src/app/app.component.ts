import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TabsPage } from '../pages/tabs/tabs';
import * as firebase from 'firebase';
import { Helper } from '../providers/helper';
import { HomeData } from '../providers/home-data';
import { Observable } from 'rxjs/Rx';


@Component({
  selector: 'event-companion',
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = TabsPage;
  dataLoaded: boolean;

  constructor(platform: Platform, statusBar: StatusBar, private splashScreen: SplashScreen
    , private helper: Helper, private homeData: HomeData) {
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
      if (!this.dataLoaded) {
        Observable.timer(100).subscribe(() => {
          firebase.storage().ref('prayer-data.json').getDownloadURL()
            .then((data) => {
              this.homeData.getPrayerTimings(data);
            });
          this.splashScreen.hide();
        });
      }
    });
  }
}
