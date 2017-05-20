import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';


@Injectable()
export class UserData {
  data: any;

  constructor(
    public http: Http
  ) { }

  load(): any {
    if (this.data) {
      return Observable.of(this.data);
    } else {
      return this.http.get('assets/data/user-data.json')
        .map(this.processData, this);
    }
  }

  processData(data: any) {
    this.data = data.json();
    this.data.settings = this.data && this.data.settings;
  }

  getUserSettings() {
    return this.load().map((data) => {
      return data.settings;
    });
  }

  updateUserSettings(data) {
    // update database
    this.data.settings = data;
  }
}
