import { Component, ViewChild } from '@angular/core';
import { Platform, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TabsPage } from '../pages/tabs/tabs';
import * as firebase from 'firebase';
import { Helper } from '../providers/helper';
import { HomeData } from '../providers/home-data';
import { UserData } from '../providers/user-data';
import { Observable } from 'rxjs/Rx';
import { FCM } from '@ionic-native/fcm';

@Component({
  selector: 'event-companion',
  templateUrl: 'app.html'
})
export class MyApp {
  dataLoaded: boolean;
  @ViewChild('navComponent') navCtrl;

  constructor(private platform: Platform, statusBar: StatusBar, private splashScreen: SplashScreen
    , private helper: Helper, private homeData: HomeData, private userData: UserData, public toastCtrl: ToastController
    , private fcm: FCM) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      Observable.timer(250).subscribe(() => {
        this.subscribe();
      });
    });
  }

  setupFCM() {
    // this.appParams = { type: 'event', id: '-Kksm__k61pNY70oV8HJ' };
    if (this.platform.is('cordova')) {
      this.fcm.getToken();

      this.userData.setPushObject(this.fcm);
      this.userData.updatePushSettings();

      this.fcm.onNotification().subscribe(data => {
        if (data.wasTapped) {
          // alert(JSON.stringify(data));
          Observable.timer(50).subscribe(() => {
            this.navCtrl.setRoot(TabsPage, { id: data.id, type: data.type });
          });
        } else {
          Observable.timer(50).subscribe(() => {
            this.navCtrl.setRoot(TabsPage, { type: data.type });
          });
          // this.toastCtrl.create({
          //   message: 'There is a new ' + data.type + ', please refresh the app..',
          //   duration: 2000
          // }).present();
          // alert(JSON.stringify(data));
          // console.log("Received in foreground");
        };
      })

      this.fcm.onTokenRefresh().subscribe(token => {
      });
    }
    // Observable.timer(0).subscribe(() => {
    this.navCtrl.setRoot(TabsPage);
    // });
  }

  subscribe() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.helper.setUser(user);
      } else {
        // No user is signed in.
      }
      if (!this.dataLoaded) {
        Observable.timer(10).subscribe(() => {
          firebase.storage().ref('prayer-data.json').getDownloadURL()
            .then((data) => {
              this.homeData.getPrayerTimings(data);
            });
          this.splashScreen.hide();
        });
      }
      Observable.timer(10).subscribe(() => {
        this.setupFCM();
      });
    });
  }
}
