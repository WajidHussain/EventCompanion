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
    this.data.forEach((element) => {
      if (element.date === todaysDate && element.month === thisMonth) {
        return element;
      }
    });
  }

  getPrayerTimes() {
    return this.loadPrayerTimes().map((items) => {
      return items;
    });
  }


}
// {
//       "id":"102",
//       "rsvpStatus": "yes",
//       "adultCount": "2",
//       "childCount": "1"
//     },
//     {
//       "id":"104",
//       "rsvpStatus": "maybe",
//       "adultCount": "1",
//       "childCount": "0"
//     }