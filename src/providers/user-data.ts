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
import { Platform, ToastController } from "ionic-angular";


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


  constructor(public http: Http, private helper: Helper
    , public toastCtrl: ToastController, private afDB: AngularFireDatabase, private platform: Platform) {
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

  triggerNotification() {
    Observable.timer(5000).subscribe(() => {
      this.onNotification({
        additionalData: {
          id: "-KmK6KqglNYDj7CaZp0x",
          type: "event",
          foreground: true
        }
      });
    });
  }

  getUserSettings() {
    return this.load().map((data) => {
      return data;
    });
  }

  setNavCtrl(navCtrl: any) {
    this.navCtrl = navCtrl;

  }

  updateUserSettings(data) {
    return new Promise((resolve, reject) => {
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
      resolve();
    });
  }

  updateTopicSubs(data: any) {
    if (this.platform.is('cordova')) {
      // unsubs from all
      this.pusher.unregister(() => {
      }, () => {
      });
      // now subs to other msjids
      if (data.otherMasjidNotify) {
        if (data.otherMasjidEvents) {
          Observable.timer(500).subscribe(() => {
            data.otherMasjidEvents.forEach(element => {
              this.pusher.subscribe('event_' + element, () => {
              }, () => {
              });
            });
          });
        }
        if (data.otherMasjidAnnouncements) {
          Observable.timer(1500).subscribe(() => {
            data.otherMasjidAnnouncements.forEach(element => {
              this.pusher.subscribe('announcement_' + element, () => {
              }, () => {
              });
            });
          });
        }
      }
      if (data.homeMasjidNotify && data.homeMasjid) {
        Observable.timer(3000).subscribe(() => {
          this.pusher.subscribe('event_' + data.homeMasjid, () => {
          }, () => {
          });
          this.pusher.subscribe('announcement_' + data.homeMasjid, () => {
          }, () => {
          });
        });
      }
      Observable.timer(6500).subscribe(() => {
        this.setFCMSubscription();
      });
    }

  }


  public updatePushSettings() {
    Observable.timer(3500).subscribe(() => {
      this.getUserSettings().subscribe(data => {
        if (this.data.settings.otherMasjidNotify) {
          if (this.data.settings.otherMasjidEvents) {
            this.data.settings.otherMasjidEvents.forEach(element => {
              Observable.timer(50).subscribe(() => {
                this.pusher.subscribe('event_' + element, () => {
                }, (e) => {
                });
              });
            });
          }
          if (this.data.settings.otherMasjidAnnouncements) {
            this.data.settings.otherMasjidAnnouncements.forEach(element => {
              Observable.timer(50).subscribe(() => {
                this.pusher.subscribe('announcement_' + element, () => {
                }, () => {
                });
              });
            });
          }
        }
        if (this.data.settings.homeMasjidNotify && this.data.settings.homeMasjid) {
          this.pusher.subscribe('event_' + this.data.settings.homeMasjid, () => {
          }, () => {
          });
          this.pusher.subscribe('announcement_' + this.data.settings.homeMasjid, () => {
          }, () => {
          });
        }
      });
    });
  }

  public setFCMSubscription(obj?: any) {
    if (obj) {
      this.pusher = obj;
    }    
  }


  onNotification(data: any) {
    this.mySubject.next(undefined);
    if (data.additionalData && !data.additionalData.foreground) {
      this.navCtrl.setRoot(TabsPage, { id: data.additionalData.id, type: data.additionalData.type });
      return;
    }
    // opened in foreground
    if (data.additionalData.foreground) {
    }
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
