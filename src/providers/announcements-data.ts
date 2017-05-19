import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import { Helper } from './helper';
import * as moment from 'moment';



@Injectable()
export class AnnouncementsData {
  data: any;

  constructor(public http: Http, public helper: Helper) { }

  load(): any {
    if (this.data) {
      return Observable.of(this.data);
    } else {
      return this.http.get('assets/data/announcements-data.json')
        .map(this.processData, this);
    }
  }

  processData(data: any) {
    this.data = data.json();
    this.data.announcements = this.data && this.data.announcements;
    this.data.myAnnouncements = this.data && this.data.myAnnouncements;
    this.data.announcements.forEach((item) => {
      let myData = this.findMyAnnouncementById(item.id);
      item.read = myData && myData.read || false;
      item.font = this.helper.getFont(item.category)
    });

    return this.data;
  }

  public getAnnouncements() {
    return this.load().map((items) => {
      let announcements = [];
      this.data.announcements.forEach((item) => {
        announcements.push({
          title: item.title, location: item.location, read: item.read, id: item.id,
          timestamp: moment(item.createdDateTime).from(new Date()),
          fee: item.fee
          , description: item.description, category: item.category, font: item.font
        });
      });
      return announcements;
    });
  }

  updateEventRead(announcementId: string) {
    // database
    this.findAnnouncementById(announcementId).read = true;
    // this.findSubscriptionById(eventId).read = true;
  }

  getAnnouncementDetails(announcementId: string) {
    return this.load().map((items) => {
      let item = this.findAnnouncementById(announcementId);
      item.timestamp = moment(item.createdDateTime).from(new Date())
      return item;
    });
  }

  findAnnouncementById(id: string) {
    return this.data.announcements.find((item) => {
      return item.id === id;
    });
  }

  findMyAnnouncementById(id: string) {
    return this.data.myAnnouncements.find((item) => {
      return item.announcementId === id;
    });
  }


}
