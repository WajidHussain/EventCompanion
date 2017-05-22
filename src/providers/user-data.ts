import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import { Helper } from './helper';
import 'rxjs/add/observable/fromPromise';

@Injectable()
export class UserData {
  data: any;
  azureClient: any;
  userSettingsTable: any;
  private userSettingsTableName = 'user_settings';

  constructor(public http: Http, private helper: Helper) {
  }


  load(): any {
    if (this.data) {
      return Observable.of(this.data);
    } else {
      if (this.helper.Mock) {
        return this.http.get('assets/data/user-data.json')
          .map(this.processDataMock, this);
      } else {
        this.userSettingsTable = this.helper.loadProvider().getTable(this.userSettingsTableName);
        return Observable.fromPromise(this.userSettingsTable.read({ id: "" }))
          .map(this.processData, this);
      }
    }
  }

  processDataMock(data: any) {
    this.data = data.json();
    // this.data.settings = this.data && this.data.settings;
  }

  processData(data: any) {
    if (!data || data.length === 0) {
      return this.data = {
        eventNotify: false,
        announcementNotify: false,
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
    // update database
    this.data = data;
  }
}
