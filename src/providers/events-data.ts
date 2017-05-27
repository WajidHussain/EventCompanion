import { Injectable } from '@angular/core';

import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Helper } from './helper';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/forkJoin';
import * as moment from 'moment';
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable()
export class EventsData {
  data: any;

  constructor(public http: Http, public helper: Helper, private afDB: AngularFireDatabase
  ) { }


  create() {
    this.helper.getToken().then(() => {

      let k = this.afDB.list('/events');
      k.push({
        "title": "Open House and community BBQ",
        "location": "ICOR",
        "description": "This is an Open house with Barbecue lunch , Graduation cermony , kids activities and Bazaar",
        "startDateTime": "05/26/2017 11:30:00 AM",
        "endDateTime": "05/26/2017   5:30:00 PM",
        "allowRsvp": true,
        "adultHeadCount": true,
        "childrenHeadCount": true,
        "fee": false,
        "picture": false,
        "category": "food"
      });
    });
  }

  load(): any {
    // this.create();
    if (this.data) {
      return Observable.of(this.data);
    } else {
      if (this.helper.Mock) {
        return this.http.get('assets/data/events-data.json')
          .map(this.processDataMock, this);
      } else {
        let prm = new Promise((resolve, reject) => {
          this.helper.getToken().then((uid) => {
            this.afDB.database.ref('events').once('value', (snapshot: any) => {
              this.data = { events: [], eventSubscriptions: [] };
              snapshot.forEach((childSnapshot) => {
                this.data.events.push(childSnapshot.val());
                this.data.events[this.data.events.length - 1].id = childSnapshot.key;
              });
              if (uid) {
                this.afDB.database.ref('events_rsvp').orderByChild("userId").equalTo(uid).once('value', (rsvpSS: any) => {
                  rsvpSS.forEach((rsvpChildSnapshot: any) => {
                    this.data.eventSubscriptions.push(rsvpChildSnapshot.val());
                    this.data.eventSubscriptions[this.data.eventSubscriptions.length - 1].id =
                      rsvpChildSnapshot.key;
                  });
                  resolve();
                });
              } else {
                resolve();
              }
            });
          });
        });
        return Observable.fromPromise(prm).map(this.processData, this);
      }
    }
  }

  processData() {
    if (this.data.eventSubscriptions && this.data.eventSubscriptions.length > 0) {
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
    }
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

  public getEvents(category: string) {
    if (category === "upcoming") {
      return this.getUpcomingEvents();
    } else if (category === "attending") {
      return this.getAttendingEvents();
    } else {
      return this.getPastEvents();
    }
  }

  getPastEvents() {
    return this.load().map((items) => {
      let eventList = [{ header: "", events: [] }];
      items.events.forEach(item => {
        if (Date.now() - <any>(new Date(item.endDateTime)) > 0) {
          eventList[0].events.push(this.createEventListItem(item));
        }
      });
      return eventList;
    });
  }

  getAttendingEvents() {
    return this.load().map((items) => {
      let eventList = [{ header: "Today", events: [] }, { header: "Tomorrow", events: [] },
      { header: "This week", events: [] }, { header: "Next week", events: [] }, { header: "Future", events: [] }];
      items.events.forEach(item => {
        let subscription = this.findSubscriptionById(item.id);
        if (subscription && subscription.attending) {
          this.categorizeEventsPerDay(item, eventList);
        }
      });
      return eventList;
    });
  }

  getUpcomingEvents() {
    return this.load().map((items) => {
      let eventList = [{ header: "Today", events: [] }, { header: "Tomorrow", events: [] },
      { header: "This week", events: [] }, { header: "Next week", events: [] }, { header: "Future", events: [] }];
      // assuming events are sorted on server
      items.events.forEach(item => {
        if (Date.now() - <any>(new Date(item.endDateTime)) <= 0) {
          this.categorizeEventsPerDay(item, eventList);
        }
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
      category: item.category,
      read: item.read === undefined ? false : item.read,
      font: this.helper.getFont(item.category)
    };
  }

  getEventDetails(eventId: string) {
    return this.load().map((items) => {
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
      // insert
      this.helper.getToken().then((uid) => {
        let k = this.afDB.list('/events_rsvp');
        let item = k.push({
          eventId: eventId,
          read: true,
          userId: uid
        });
        this.data.eventSubscriptions.push({
          eventId: eventId,
          read: true,
          id: item.key
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
        this.helper.getToken().then(() => {
          this.afDB.database.ref('events_rsvp').child(subscription.id).update({
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

}