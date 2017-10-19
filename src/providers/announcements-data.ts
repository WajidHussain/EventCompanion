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
              if (data.settings.homeMasjid)
                allSources.push(data.settings.homeMasjid);
              if (data.settings.otherMasjidAnnouncements) {
                data.settings.otherMasjidAnnouncements.forEach(element => {
                  allSources.push(element);
                });
              }
              allSources.sort();
              this.data = { announcements: [], myAnnouncements: [] };
              if (data.settings.isMock || !uid) {
                this.getMockData()
                resolve(this.data.announcements);
                return;
              }
              if (allSources.length === 0) {
                resolve(this.data.announcements);
                return;
              }
              let index = 0;
              allSources.forEach((item: string) => {
                this.runQueryAndReturnResult(item)
                  .then((snapshot: any) => {
                    ++index;
                    if (index === allSources.length) {
                      this.runMyAnnouncementsQueryAndReturnResult(uid, allSources)
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
                element.sourceMasjid = item;
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

  runMyAnnouncementsQueryAndReturnResult(uid: string, sourceMasjids: string[]) {
    let index = 0;
    let prom = new Promise((resolve, reject) => {
      sourceMasjids.forEach((value: string) => {
        this.afDB.database.ref(this.announcementSubsTableName + "/" + value).child(uid).limitToLast(40)
          .once('value', (snapshot: any) => {
            let subs = snapshot.val();
            if (subs) {
              for (var key in subs) {
                if (subs.hasOwnProperty(key)) {
                  var element = subs[key];
                  if (element) {
                    element.sourceMasjid = value;
                    this.data.myAnnouncements.push(element);
                    this.data.myAnnouncements[this.data.myAnnouncements.length - 1].id = key;
                  }
                }
              }
            }
            ++index;
            if (index === sourceMasjids.length) {
              resolve(snapshot);
            }
          });
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
      let announcement = this.findAnnouncementById(announcementId);
      // insert
      this.helper.getToken().then((uid) => {
        let pushRef = this.afDB.database.ref(this.announcementSubsTableName + "/" + announcement.sourceMasjid).child(uid).push({
          announcementId: announcementId,
          read: true
        });
        this.data.myAnnouncements.push({
          announcementId: announcementId,
          read: true,
          sourceMasjid: announcement.sourceMasjid,
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

  getMockData() {
    this.data.announcements = [
      {
        "category": "service",
        "description": "We need volunteers for preparing sandwiches for the upcoming 'Food for poor' program. Please sign up at..",
        "fee": "Free",
        "location": "test",
        "picture": "",
        "source": "ICOR",
        "timestamp": 1497440612517,
        "title": "Volunteers Needed"
      },
      {
        "category": "women",
        "description": "By the Grace of ALMIGHTY ALLAH, Masjid Madeena will be starting girls’ Maktab from November 6. Classes will be held in the original masjid area from 4:30 – 6:00 PM Monday – Thursday. Spaces are limited so please enroll as soon as possible.",
        "fee": "$11",
        "location": "Madeena Masjid",
        "picture": "",
        "source": "Madeena Masjid",
        "timestamp": 1508124578555,
        "title": "1"
      }
    ];

  }

}
