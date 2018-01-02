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
import { Storage } from '@ionic/storage';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { Push, PushObject, PushOptions, AndroidPushOptions } from '@ionic-native/push';

const options: PushOptions = {
  android: <AndroidPushOptions>{
    senderID: "861672505274"
  },
  ios: {
    alert: 'true',
    badge: true,
    sound: 'true'
  },
  windows: {}
};

@Component({
  selector: 'event-companion',
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild('navComponent') navCtrl;

  private pushObject: PushObject;
  constructor(private platform: Platform, statusBar: StatusBar, private splashScreen: SplashScreen
    , private helper: Helper, private homeData: HomeData, private userData: UserData, public toastCtrl: ToastController
    , private push: Push, public storage: Storage, ) {
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
    this.userData.setNavCtrl(this.navCtrl);
    // this.userData.triggerNotification();
    if (this.platform.is('cordova')) {
      // to check if we have permission
      this.push.hasPermission()
        .then((res: any) => {
          if (res.isEnabled) {
            this.pushObject = this.push.init(options);
            this.pushObject.on('registration').subscribe((registration: any) => {
              this.userData.setFCMSubscription(this.pushObject);
              this.userData.updatePushSettings();
            });
            this.pushObject.on('notification').subscribe((notification: any) => {
              this.pushObject.clearAllNotifications().then(() => {
              }).catch(() => {
              });
              this.userData.onNotification(notification);
            }, (error: any) => alert('error in notification' + alert(error)));
            this.pushObject.on('error').subscribe(error => alert('Error with Push plugin ' + error.message));
          } else {
            // alert('No permission');
          }

        });

    }
    this.loadPage();
  }

  loadPage() {
    this.storage.get('hasSeenTutorial')
      .then((hasSeenTutorial) => {
        if (hasSeenTutorial) {
          this.navCtrl.setRoot(TabsPage);
        } else {
          this.navCtrl.setRoot(TutorialPage);
        }
      });
  }

  subscribe() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.helper.setUser(user);
      } else {
        // No user is signed in.
      }
      Observable.timer(10).subscribe(() => {
        this.setupFCM();
      });
    });
  }
}
