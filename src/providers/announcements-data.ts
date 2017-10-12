import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import { Helper } from './helper';
import { UserData } from "./user-data";
import { AngularFireDatabase } from 'angularfire2/database';


@Injectable()
export class AnnouncementsData {
  data: any;
  private announcementsTableName: string = 'announcements';
  private announcementSubsTableName: string = 'announcements_read';

  constructor(public http: Http, public helper: Helper, private afDB: AngularFireDatabase, private userData: UserData) { 
    this.userData.mySubject.subscribe((value) => {
      this.data = undefined;
    });
  }

  load(forceRefresh?: boolean): any {
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
            this.userData.getUserSettings().subscribe((data) => {
              let allSources = [];
              allSources.push(data.settings.homeMasjid);
              if (data.settings.otherMasjidAnnouncements) {
                data.settings.otherMasjidAnnouncements.forEach(element => {
                  allSources.push(element);
                });
              }
              allSources.sort();
              this.data = { announcements: [], myAnnouncements: [] };
              if (allSources.length === 0) {
                resolve(this.data.announcements);
              }
              let index = 0;
              allSources.forEach((item: string) => {
                this.runQueryAndReturnResult(item)
                  .then((snapshot: any) => {
                    ++index;
                    if (index === allSources.length) {
                      this.runMyAnnouncementsQueryAndReturnResult(uid)
                        .then((subssnapshot: any) => {
                          resolve(this.data.announcements);
                        });
                    }
                  });
              });
            });
          });
        });
        return Observable.fromPromise(prm).map(this.processData, this);
      }
    }
  }

  runQueryAndReturnResult(item: string) {
    let prom = new Promise((resolve, reject) => {
      this.afDB.database.ref(this.announcementsTableName).child(item).limitToLast(25)
        .orderByChild('timestamp').once('value', (snapshot: any) => {
          let records = snapshot.val();
          if (records) {
            for (var key in records) {
              if (records.hasOwnProperty(key)) {
                var element = records[key];
                this.data.announcements.push(element);
                this.data.announcements[this.data.announcements.length - 1].id = key;
              }
            }
          }
          resolve(snapshot);
        });
    });
    return prom;
  }

  runMyAnnouncementsQueryAndReturnResult(item: string) {
    let prom = new Promise((resolve, reject) => {
      this.afDB.database.ref(this.announcementSubsTableName).child(item).limitToLast(100)
        .once('value', (snapshot: any) => {
          let subs = snapshot.val();
          if (subs) {
            for (var key in subs) {
              if (subs.hasOwnProperty(key)) {
                var element = subs[key];
                this.data.myAnnouncements.push(element);
                // this.data.myAnnouncements[this.data.myAnnouncements.length - 1].id = key;
              }
            }
          }
          resolve(snapshot);
        });
    });
    return prom;
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
        let pushRef = this.afDB.database.ref(this.announcementSubsTableName).child(uid).push({
          announcementId: announcementId,
          read: true
        });
        this.data.myAnnouncements.push({
          announcementId: announcementId,
          read: true,
          id: pushRef.key
        });
      });
    }
    this.findAnnouncementById(announcementId).read = true;
  }

  getAnnouncementDetails(announcementId: string) {
    return this.load().map((items) => {
      return this.findAnnouncementById(announcementId);
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
