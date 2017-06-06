import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import { Helper } from './helper';
import 'rxjs/add/observable/fromPromise';
import { AngularFireDatabase } from 'angularfire2/database';


@Injectable()
export class UserData {
  data: any;
  pusher: any;
  azureClient: any;
  userSettingsTable: any;
  private userSettingsTableName = 'user_settings';
  private userQueryTableName = 'user_query';


  constructor(public http: Http, private helper: Helper, private afDB: AngularFireDatabase) {
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
            this.afDB.database.ref(this.userSettingsTableName)
              .orderByChild("userId").equalTo(uid).once('value', (snapshot: any) => {
                this.data = {};
                snapshot.forEach((childSnapshot) => {
                  this.data = childSnapshot.val();
                  this.data.id = childSnapshot.key;
                });
                resolve();

              });
          });
        });
        return Observable.fromPromise(prm).map(this.processData, this);
      }
    }
  }

  processDataMock(data: any) {
    this.data = data.json();
    // this.data.settings = this.data && this.data.settings;
  }

  processData(data?: any) {
    if (!data || data.length === 0) {
      return this.data = {
        eventNotify: true,
        announcementNotify: true,
        calendarUpdate: true
      }
    } else {
      return this.data = data;
    }
  }

  getUserSettings() {
    return this.load().map((data) => {
      return data;
    });
  }

  updateUserSettings(data) {
    if (!data.id) {
      this.helper.getToken().then((uid) => {
        let k = this.afDB.list(this.userSettingsTableName);
        let item = k.push({
          eventNotify: data.eventNotify,
          announcementNotify: data.announcementNotify,
          calendarUpdate: data.calendarUpdate,
          userId: uid
        });
        this.data.id = item.key;
      });
    } else {
      // update database
      this.afDB.database.ref(this.userSettingsTableName).child(data.id).update({
        eventNotify: data.eventNotify,
        announcementNotify: data.announcementNotify,
        calendarUpdate: data.calendarUpdate
      })
    }
    this.data = data;
    this.updatePushSettings();
  }

  setPushObject(obj: any) {
    this.pusher = obj;
  }

  public updatePushSettings() {
    this.processData();
    if (this.data.eventNotify) {
      this.pusher.subscribeToTopic('event');
    } else {
      this.pusher.unsubscribeFromTopic("event");
    }
    if (this.data.announcementNotify) {
      this.pusher.subscribeToTopic('announcement');
    } else {
      this.pusher.unsubscribeFromTopic("announcement");
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
