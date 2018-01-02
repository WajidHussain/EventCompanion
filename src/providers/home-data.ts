import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Helper } from './helper';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import * as moment from 'moment';
import { Observable } from 'rxjs/Rx';


@Injectable()
export class HomeData {
  data: any;
  getter: any;
  times: any;

  constructor(public http: Http, public helper: Helper) { }

  load(): any {
    if (this.times) {
      return Observable.of(this.times);
    } else {
      return this.http.get('assets/data/prayer-data.json')
        .map(this.processPrayerTimes, this);
    }
  }

  readPrayerTimes() {
    return new Promise((resolve) => {
      if (this.times) {
        resolve(this.times);
      } else {
        this.setObservable(resolve);
      }
    });
  }

  private setObservable(fnRef: Function) {
    if (this.times) {
      fnRef(this.times);
    } else {
      Observable.timer(1000).subscribe(() => {
        this.setObservable(fnRef);
      });
    }
  }


  processPrayerTimes(data) {
    let todaysDate = moment().date();
    let thisMonth = moment().format("MMMM");
    this.data = data.json();
    let times = this.data.find((element) => {
      if (element.day === todaysDate && element.month === thisMonth) {
        return element;
      }
    });
    return this.times = times;
  }

  getPrayerTimes() {
    return this.load().map((items) => {
      return items;
    });
  }


}