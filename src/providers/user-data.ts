import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import { Helper } from './helper';
import 'rxjs/add/observable/fromPromise';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AngularFireDatabase } from 'angularfire2/database';
import { TabsPage } from '../pages/tabs/tabs';
import { Platform } from "ionic-angular";


@Injectable()
export class UserData {
  data: any;
  pusher: any;
  navCtrl: any;
  azureClient: any;
  userSettingsTable: any;
  private userSettingsTableName = 'user_settings';
  private userQueryTableName = 'user_query';
  private masajidsTableName = 'masjids';
  public mySubject: BehaviorSubject<any> = new BehaviorSubject<any>(0);


  constructor(public http: Http, private helper: Helper, private afDB: AngularFireDatabase, private platform: Platform) {
  }


  load(): any {
    if (this.data) {
      return Observable.of(this.data);
    } else {
      if (this.helper.Mock) {
        return this.http.get('assets/data/user-data.json')
          .map(this.processDataMock, this);
      } else {
        let prm = new Promise((resolve, reject) => {
          this.helper.getToken().then((uid) => {
            this.data = {};
            this.afDB.database.ref(this.masajidsTableName).once('value', (data: any) => {
              if (data && data.val()) {
                this.data.masjids = [];
                data.forEach((childSnapshot) => {
                  this.data.masjids.push({ id: childSnapshot.key, val: childSnapshot.val() });
                });
              }
            });
            this.afDB.database.ref(this.userSettingsTableName)
              .equalTo(uid).orderByChild("userId")
              .once('value', (snapshot: any) => {
                if (snapshot && snapshot.val()) {
                  this.data.settings = snapshot.val()[Object.keys(snapshot.val())[0]];
                  this.data.id = Object.keys(snapshot.val())[0];
                } else { // user not signed in or has not selected anything
                  if (!this.helper.isUserSignedIn()) {
                    this.data.settings = { isMock: true };
                  } else {
                    this.data.settings = {};
                  }
                }
                resolve(this.data);
              });
          });
        });
        return Observable.fromPromise(prm).map(this.processData, this);
      }
    }
  }

  processDataMock(data: any) {
    this.data = data.json();
  }

  processData() {
    if (!this.data || this.data.length === 0) {
      return this.data = {
        otherMasjidEvents: [],
        otherMasjidAnnouncements: [],
        homeMasjid: "",
        masjids: [],
        calendarUpdate: true,
        otherMasjidNotify: false,
        homeMasjidNotify: false
      }
    } else {
      return this.data;
    }
  }

  getUserSettings() {
    return this.load().map((data) => {
      return data;
    });
  }

  updateUserSettings(data) {
    data.id = this.data.id;
    this.helper.getToken().then((uid) => {
      if (!this.data.id) {
        let k = this.afDB.list(this.userSettingsTableName);
        let item = k.push({
          otherMasjidEvents: data.otherMasjidEvents ? data.otherMasjidEvents.sort() : "",
          otherMasjidAnnouncements: data.otherMasjidAnnouncements ? data.otherMasjidAnnouncements.sort() : "",
          calendarUpdate: data.calendarUpdate || false,
          homeMasjid: data.homeMasjid,
          homeMasjidNotify: data.homeMasjidNotify || false,
          otherMasjidNotify: data.otherMasjidNotify || false,
          userId: uid
        });
        this.data.id = item.key;
      } else {
        // first unsubs from existing topics, then update the db, then subscribe to new topics
        // update database
        this.afDB.database.ref(this.userSettingsTableName).child(data.id).update({
          otherMasjidEvents: data.otherMasjidEvents ? data.otherMasjidEvents.sort() : "",
          otherMasjidAnnouncements: data.otherMasjidAnnouncements ? data.otherMasjidAnnouncements.sort() : "",
          calendarUpdate: data.calendarUpdate || false,
          homeMasjidNotify: data.homeMasjidNotify || false,
          otherMasjidNotify: data.otherMasjidNotify || false,
          homeMasjid: data.homeMasjid,
        });
        // reset all local data so that new data can be loaded when user navigates to tab
      }
    });
    this.updateTopicSubs(data);
    this.data.settings = data;
    this.mySubject.next(this.data.settings);
  }

  updateTopicSubs(data: any) {
    if (this.platform.is('cordova')) {
      // unsubs from all
      this.data.masjids.forEach(element => {
        this.pusher.unsubscribeFromTopic('event_' + element.id);
        this.pusher.unsubscribeFromTopic('announcement_' + element.id);
      });
      // now subs to other msjids
      if (data.otherMasjidNotify) {
        if (data.otherMasjidEvents) {
          data.otherMasjidEvents.forEach(element => {
            this.pusher.subscribeToTopic('event_' + element);
          });
        }
        if (data.otherMasjidAnnouncements) {
          data.otherMasjidAnnouncements.forEach(element => {
            this.pusher.subscribeToTopic('announcement_' + element);
          });
        }
      }
      if (data.homeMasjidNotify && data.homeMasjid) {
        this.pusher.subscribeToTopic('event_' + data.homeMasjid);
        this.pusher.subscribeToTopic('announcement_' + data.homeMasjid);
      }
      this.setFCMSubscription();
    }
  }


  public updatePushSettings(obj: any, navCtrl: any) {
    this.pusher = obj;
    this.navCtrl = navCtrl;
    this.getUserSettings().subscribe(data => {
      if (this.data.otherMasjidNotify) {
        if (this.data.otherMasjidEvents) {
          this.data.otherMasjidEvents.forEach(element => {
            this.pusher.subscribeToTopic('event_' + element);
          });
        }
        if (this.data.otherMasjidAnnouncements) {
          this.data.otherMasjidAnnouncements.forEach(element => {
            this.pusher.subscribeToTopic('announcement_' + element);
          });
        }
      }
      if (this.data.homeMasjidNotify && this.data.homeMasjid) {
        this.pusher.subscribeToTopic('event_' + this.data.homeMasjid);
        this.pusher.subscribeToTopic('announcement_' + this.data.homeMasjid);
      }
    });
  }

  public setFCMSubscription() {
    this.pusher.onNotification().subscribe(data => {
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
  }

  updateSupportQuery(query: string) {
    return this.helper.getToken().then((uid) => {
      let k = this.afDB.list(this.userQueryTableName);
      k.push({
        query: query,
        userId: uid,
        email: this.helper.loggedInUser.email
      });
    });
  }
}
