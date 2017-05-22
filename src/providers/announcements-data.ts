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
  private announcementsTableName: string = 'announcements';
  private announcementsTable: any;
  private announcementSubsTableName: string = 'announcements_read';
  private announcementSubsTable: any;

  constructor(public http: Http, public helper: Helper) { }

  load(forceRefresh?: boolean): any {
    if (this.data && !forceRefresh) {
      return Observable.of(this.data);
    } else {
      if (this.helper.Mock) {
        return this.http.get('assets/data/announcements-data.json')
          .map(this.processDataMock, this);
      } else {
        this.announcementsTable = this.helper.loadProvider().getTable(this.announcementsTableName);
        this.announcementSubsTable = this.helper.loadProvider().getTable(this.announcementSubsTableName);
        let subs = Observable.fromPromise(this.announcementSubsTable.where({ userId: "wajidhussain.m@gmail.com" })
          .read().then((data) => {
            this.data = {};
            this.data.myAnnouncements = data;
          }));
        let anns = Observable.fromPromise(this.announcementsTable
          .orderByDescending('updatedAt').read().then((data) => {
            this.data.announcements = data;
          }));
        return Observable.forkJoin([subs, anns])
          .map(this.processData, this);
      }
    }
  }

  processData(data: any) {
    this.data.announcements.forEach((item) => {
      let myData = this.findMyAnnouncementById(item.id);
      item.read = myData || false;
      item.font = this.helper.getFont(item.category)
    });

    return this.data;
  }

  processDataMock(data: any) {
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

  public getAnnouncements(forceRefresh?: boolean) {
    return this.load(forceRefresh).map((items) => {
      let announcements = [];
      this.data.announcements.forEach((item) => {
        announcements.push({
          title: item.title, location: item.location, read: item.read, id: item.id,
          timestamp: moment(item.createdAt).from(new Date()),
          fee: item.fee
          , description: item.description, category: item.category, font: item.font
        });
      });
      return announcements;
    });
  }

  updateEventRead(announcementId: string) {
    // database
    if (!this.findMyAnnouncementById(announcementId)) {
      // insert
      this.announcementSubsTable.insert({
        announcementId: announcementId,
        userId: "wajidhussain.m@gmail.com"
      });
    }
    this.findAnnouncementById(announcementId).read = true;
    // this.findSubscriptionById(eventId).read = true;
  }

  getAnnouncementDetails(announcementId: string) {
    return this.load().map((items) => {
      let item = this.findAnnouncementById(announcementId);
      item.timestamp = moment(item.createdAt).from(new Date())
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
