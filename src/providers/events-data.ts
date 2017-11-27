import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Helper } from './helper';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/forkJoin';
import * as moment from 'moment';
import { UserData } from "./user-data";
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable()
export class EventsData {
  data: any;
  private eventsTableName = "events";
  private eventSubsTableName = "events_rsvp";

  constructor(public http: Http, public helper: Helper, private afDB: AngularFireDatabase, private userData: UserData
  ) {
    this.userData.mySubject.subscribe((value) => {
      this.data = undefined;
      // this.load(true);
    });
  }


  load(refresh): any {
    if (this.data && !refresh) {
      return Observable.of(this.data);
    } else {
      if (this.helper.Mock) {
        return this.http.get('assets/data/events-data.json')
          .map(this.processDataMock, this);
      } else {
        let prm = new Promise((resolve, reject) => {
          this.helper.getToken().then((uid) => {
            this.userData.getUserSettings().subscribe((data) => {
              let allSources = [];
              if (data.settings.homeMasjid)
                allSources.push(data.settings.homeMasjid);
              if (data.settings.otherMasjidEvents) {
                data.settings.otherMasjidEvents.forEach(element => {
                  allSources.push(element);
                });
              }
              this.data = { events: [], eventSubscriptions: [] };
              if (data.settings.isMock || !uid) {
                this.getMockData()
                resolve(this.data.events);
                return;
              }
              if (allSources.length === 0) {
                resolve(this.data.events);
                return;
              }
              let index = 0;
              allSources.forEach((item: string) => {
                this.runQueryAndReturnResult(item)
                  .then((snapshot: any) => {
                    ++index;
                    if (index === allSources.length) {
                      this.runMyEventsQueryAndReturnResult(uid, allSources)
                        .then((subssnapshot: any) => {
                          resolve(this.data.eventSubscriptions);
                          return;
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
      this.afDB.database.ref(this.eventsTableName).child(item).limitToLast(40)
        .orderByChild('startDateTime').once('value', (snapshot: any) => {
          let records = snapshot.val();
          if (records) {
            for (var key in records) {
              if (records.hasOwnProperty(key)) {
                var element = records[key];
                element.sourceMasjid = item;
                this.data.events.push(element);
                this.data.events[this.data.events.length - 1].id = key;
              }
            }
          }
          resolve(snapshot);
        });
    });
    return prom;
  }

  runMyEventsQueryAndReturnResult(uid: string, sourceMasjids: string[]) {
    let index = 0;
    let prom = new Promise((resolve, reject) => {
      sourceMasjids.forEach((value: string) => {
        this.afDB.database.ref(this.eventSubsTableName + "/" + value).child(uid).limitToLast(40)
          .once('value', (snapshot: any) => {
            let subs = snapshot.val();
            if (subs) {
              for (var key in subs) {
                if (subs.hasOwnProperty(key)) {
                  var element = subs[key];
                  if (element) {
                    element.sourceMasjid = value;
                    this.data.eventSubscriptions.push(element);
                    this.data.eventSubscriptions[this.data.eventSubscriptions.length - 1].id = key;
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

  processData() {
    // if (this.data.eventSubscriptions && this.data.eventSubscriptions.length > 0) {
    this.data.events.forEach((event) => {
      // merge subscription with actual event
      // event.read = false;
      let matchedSubscription = this.findSubscriptionById(event.id);
      // if (event.allowRsvp) {
      //   Object.assign(event, matchedSubscription);
      // }
      event.read = matchedSubscription || false;
      event.attending = matchedSubscription && matchedSubscription.attending || false;
      event.rsvpStatus = matchedSubscription && matchedSubscription.rsvpStatus;
      event.adultCount = matchedSubscription && matchedSubscription.adultCount || 0;
      event.childCount = matchedSubscription && matchedSubscription.childCount || 0;
    });
    // }
    return this.data;
  }

  processDataMock(data: any) {
    this.data = data.json();
    this.data.events = this.data && this.data.events;
    this.data.eventSubscriptions = this.data && this.data.eventSubscriptions;
    this.data.events.forEach((event) => {
      // merge subscription with actual event
      event.read = false;
      let matchedSubscription = this.findSubscriptionById(event.id);
      if (event.allowRsvp) {
        Object.assign(event, matchedSubscription);
      }
      event.read = matchedSubscription && matchedSubscription.read || false;
      event.attending = matchedSubscription && matchedSubscription.attending || false;
      event.rsvpStatus = matchedSubscription && matchedSubscription.rsvpStatus;
      event.adultCount = matchedSubscription && matchedSubscription.adultCount || 0;
      event.childCount = matchedSubscription && matchedSubscription.childCount || 0;
    });
    return this.data;
  }

  public getEvents(category: string, refresh: boolean) {
    if (category === "upcoming") {
      return this.getUpcomingEvents(refresh);
    } else if (category === "attending") {
      return this.getAttendingEvents(refresh);
    } else {
      return this.getPastEvents(refresh);
    }
  }

  getPastEvents(refresh: boolean) {
    return this.load(refresh).map((items) => {
      let eventList = [{ header: "", events: [] }];
      items.events.forEach(item => {
        if (Date.now() - <any>(new Date(item.endDateTime)) > 0) {
          eventList[0].events.push(this.createEventListItem(item));
        }
      });
      return eventList;
    });
  }

  getAttendingEvents(refresh: boolean) {
    return this.load(refresh).map((items) => {
      let eventList = [{ header: "Today", events: [] }, { header: "Tomorrow", events: [] },
      { header: "This week", events: [] }, { header: "Next week", events: [] }, { header: "Future", events: [] }];
      items.events.forEach(item => {
        let subscription = this.findSubscriptionById(item.id);
        if (subscription && subscription.attending && (Date.now() - <any>(new Date(item.endDateTime)) <= 0)) {
          this.categorizeEventsPerDay(item, eventList);
        }
      });
      eventList = eventList.filter((item) => {
        return item.events.length > 0;
      });
      return eventList;
    });
  }

  getUpcomingEvents(refresh: boolean) {
    return this.load(refresh).map((items) => {
      let eventList = [{ header: "Today", events: [] }, { header: "Tomorrow", events: [] },
      { header: "This week", events: [] }, { header: "Next week", events: [] }, { header: "Future", events: [] }];
      // assuming events are sorted on server
      items.events.forEach(item => {
        if (Date.now() - <any>(new Date(item.endDateTime)) <= 0) {
          this.categorizeEventsPerDay(item, eventList);
        }
      });
      eventList = eventList.filter((item) => {
        return item.events.length > 0;
      });
      return eventList;
    });
  }

  categorizeEventsPerDay(item: any, eventList: any) {
    if (new Date(item.endDateTime).getDate() == new Date().getDate()) {
      eventList[0].events.push(this.createEventListItem(item));
    }
    else if (new Date(item.endDateTime).getDate() - new Date().getDate() == 1) {
      eventList[1].events.push(this.createEventListItem(item));
    }
    else if (moment(item.startDateTime).isoWeek() === moment().isoWeek()) {
      eventList[2].events.push(this.createEventListItem(item));
    }
    else if (moment(item.startDateTime).isoWeek() - moment().isoWeek() == 1) {
      eventList[3].events.push(this.createEventListItem(item));
    }
    else {
      eventList[4].events.push(this.createEventListItem(item));
    }
  }

  createEventListItem(item) {
    return {
      id: item.id,
      title: item.title,
      startTime: moment(item.startDateTime).format("hh:mm A"),
      endTime: moment(item.endDateTime).format("hh:mm A"),
      location: item.location,
      source: item.source,
      category: item.category,
      read: item.read === undefined ? false : item.read,
      font: this.helper.getFont(item.category)
    };
  }

  getEventDetails(eventId: string, forceRefresh?: boolean) {
    return this.load(forceRefresh).map((items) => {
      let matchedEvent = this.findEventById(eventId);
      if (moment(matchedEvent.startDateTime).format("D") === moment(matchedEvent.endDateTime).format("D")) {
        matchedEvent.startTime = moment(matchedEvent.startDateTime).format("ddd MMM Do hh:mm A");
        matchedEvent.endTime = moment(matchedEvent.endDateTime).format("hh:mm A");
      } else {
        matchedEvent.startTime = moment(matchedEvent.startDateTime).format("MMM DD hh:mm A");
        matchedEvent.endTime = moment(matchedEvent.endDateTime).format("MMM DD hh:mm A");
      }

      return matchedEvent;
    });
  }

  updateEventRead(eventId: string) {
    // database
    if (!this.findSubscriptionById(eventId)) {
      let event = this.findEventById(eventId);
      // insert
      this.helper.getToken().then((uid) => {
        let pushRef = this.afDB.database.ref(this.eventSubsTableName + "/" + event.sourceMasjid).child(uid).push({
          eventId: eventId,
          read: true
        });
        this.data.eventSubscriptions.push({
          eventId: eventId,
          read: true,
          sourceMasjid: event.sourceMasjid,
          id: pushRef.key
        });
      });
    }
    this.findEventById(eventId).read = true;
  }

  findSubscriptionById(eventId: string) {
    return this.data.eventSubscriptions.find((item) => {
      return item.eventId === eventId;
    });
  }

  findEventById(eventId: string) {
    return this.data.events.find((item) => {
      return item.id === eventId;
    });
  }

  submit(event: any): Promise<boolean> {
    return new Promise((resolve: any, reject: any) => {
      window.setTimeout(() => {
        // database
        let subscription = this.findSubscriptionById(event.id);
        this.helper.getToken().then((uid: string) => {
          this.afDB.database.ref(this.eventSubsTableName + "/" + subscription.sourceMasjid + "/" + uid).child(subscription.id).update({
            rsvpStatus: event.rsvpStatus || false,
            adultCount: event.adultCount || 0,
            childCount: event.childCount || 0,
            attending: event.attending
          }).then(() => {
            subscription.attending = event.attending;
            subscription.rsvpStatus = event.rsvpStatus || false;
            subscription.adultCount = event.adultCount || 0;
            subscription.childCount = event.childCount || 0;

            let matchedEvent = this.findEventById(event.id);
            // update event locally
            matchedEvent.rsvpStatus = event.rsvpStatus || false;
            matchedEvent.adultCount = event.adultCount || 0;
            matchedEvent.childCount = event.adultCount || 0;
            matchedEvent.attending = event.attending;
            resolve();

          });
        }).catch((e) => {
          reject();
        });
      }, 200);
    })
  }

  getMockData() {
    this.data.events = [
      {
        "id": "-KmhxONju4zP1IpirWlL",
        "adultHeadCount": true,
        "allowRsvp": true,
        "category": "potluck",
        "childrenHeadCount": true,
        "description": "ICOR invites everyone to join for community iftaar and dinner. Arrangements are available for sisters and children as well. Please RSVP to help us serve you better.",
        "endDateTime": moment().add(4.5, "days"),
        "fee": "Free",
        "location": "Islamic Center Of Redmond.",
        "picture": "http://www.kleiner-kalender.de/images/teaser/694px/ramadan.jpg",
        "source": "ICOR",
        "startDateTime": moment().add(4.5, "days"),
        "title": "Halaqa & Potluck"
      },
      {
        "id": "-KwYRZfhCuuKFuk7oo3D",
        "adultHeadCount": true,
        "allowRsvp": true,
        "category": "service",
        "childrenHeadCount": true,
        "description": "1111",
        "endDateTime": moment().add(4, "days"),
        "fee": "$111",
        "location": "asdsd",
        "picture": "",
        "source": "Madeena Masjid",
        "startDateTime": moment().add(4, "days"),
        "title": "Sisters Social"
      }
    ];

  }

}