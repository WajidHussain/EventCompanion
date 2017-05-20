import { Injectable } from '@angular/core';

import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Helper } from './helper';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import * as moment from 'moment';


@Injectable()
export class HomeData {
  data: any;

  constructor(public http: Http, public helper: Helper) { }

  load(): any {
    if (this.data) {
      return Observable.of(this.data);
    } else {
      return this.http.get('assets/data/prayer-data.json')
        .map(this.processPrayerTimes, this);
    }
  }

  loadPrayerTimes(): any {
    let headers = new Headers();
    headers.append("Access-Control-Allow-Origin", "*");
    if (this.data) {
      return Observable.of(this.data);
    } else {
      return this.http.get('http://www.redmondmosque.org/jsonEncode.php?masjid=icoe&getData=5',
        {
          headers: headers
        }
      )
        .map(this.processPrayerTimes, this);
    }
  }

  processPrayerTimes(data) {
    let todaysDate = moment().date();
    let thisMonth = moment().format("MMM");
    this.data = data.json();
    let times = this.data.find((element) => {
      if (element.day === todaysDate && element.month === thisMonth) {
        return element;
      }
    });
    return times;
  }

  getPrayerTimes() {
    return this.load().map((items) => {
      return items;
    });
  }


}