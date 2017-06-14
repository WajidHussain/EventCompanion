import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import { Helper } from './helper';
import { AngularFireDatabase } from 'angularfire2/database';


@Injectable()
export class AnnouncementsData {
  data: any;
  private announcementsTableName: string = 'announcements';
  private announcementSubsTableName: string = 'announcements_read';

  constructor(public http: Http, public helper: Helper, private afDB: AngularFireDatabase) { }

  create() {
    this.helper.getToken().then(() => {
      let k = this.afDB.list('/announcements');
      k.push({
        "title": "Workshop recording available",
        "location": "ICOR",
        "description": "Recording are available at ..... for the workshop done on 5/20/2017.",
        "timestamp": "05/10/2017 11:00:00 AM",
        "category": "videorecording"
      });
    });
  }

  load(forceRefresh?: boolean): any {
    //this.create();
    // this.helper.isUserSignedIn();
    if (this.data && !forceRefresh) {
      return Observable.of(this.data);
    } else {
      if (this.helper.Mock) {
        return this.http.get('assets/data/announcements-data.json')
          .map(this.processDataMock, this);
      } else {
        let prm = new Promise((resolve, reject) => {
          this.helper.getToken().then((uid) => {
            this.afDB.database.ref(this.announcementsTableName).orderByChild('timestamp').limitToLast(50).once('value', (snapshot: any) => {
              this.data = { announcements: [], myAnnouncements: [] };
              let tempData = [];
              snapshot.forEach((childSnapshot) => {
                tempData.push({ id: childSnapshot.key, val: childSnapshot.val() });
              });
              for (var index = tempData.length - 1; index >= 0; index--) {
                this.data.announcements.push(tempData[index].val);
                this.data.announcements[this.data.announcements.length - 1].id = tempData[index].id;
              }
              // this.data.announcements.reverse();
              this.afDB.database.ref(this.announcementSubsTableName).equalTo(uid).orderByChild("userId").once('value', (rsvpSS: any) => {
                rsvpSS.forEach((rsvpChildSnapshot: any) => {
                  this.data.myAnnouncements.push(rsvpChildSnapshot.val());
                  this.data.myAnnouncements[this.data.myAnnouncements.length - 1].id =
                    rsvpChildSnapshot.key;
                });
                resolve();
              });
            });
          });
        });
        return Observable.fromPromise(prm).map(this.processData, this);
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
          title: item.title, location: item.location, read: item.read, id: item.id, source: item.source,
          timestamp: item.timestamp,
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
      this.helper.getToken().then((uid) => {
        let k = this.afDB.list(this.announcementSubsTableName);
        let item = k.push({
          announcementId: announcementId,
          read: true,
          userId: uid
        });
        this.data.myAnnouncements.push({
          announcementId: announcementId,
          read: true,
          id: item.key
        });
      });
    }
    this.findAnnouncementById(announcementId).read = true;
  }

  getAnnouncementDetails(announcementId: string) {
    return this.load().map((items) => {
      let item = this.findAnnouncementById(announcementId);
      
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
