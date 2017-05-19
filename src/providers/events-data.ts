import { Injectable } from '@angular/core';

import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Helper } from './helper';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import * as moment from 'moment';


@Injectable()
export class EventsData {
  data: any;

  constructor(public http: Http, public helper: Helper) { }

  load(): any {
    if (this.data) {
      return Observable.of(this.data);
    } else {
      return this.http.get('assets/data/events-data.json')
        .map(this.processData, this);
    }
  }

  processData(data: any) {
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
    this.findEventById(eventId).read = true;
    // this.findSubscriptionById(eventId).read = true;
  }

  findSubscriptionById(eventId: string) {
    return this.data.eventSubscriptions.find((item) => {
      return item.id === eventId;
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
        let subscription = this.findSubscriptionById(event.id);
        // database
        if (!subscription) {
          this.data.eventSubscriptions.push({
            id: event.id,
            attending: event.attending,
            rsvpStatus: event.rsvpStatus,
            adultCount: event.adultCount,
            childCount: event.childCount
          });
        } else {
          subscription.attending = event.attending;
          subscription.rsvpStatus = event.rsvpStatus;
          subscription.adultCount = event.adultCount;
          subscription.childCount = event.childCount;
        }

        let matchedEvent = this.findEventById(event.id);
        // update event locally
        matchedEvent.rsvpStatus = matchedEvent.rsvpStatus;
        matchedEvent.adultCount = matchedEvent.adultCount;
        matchedEvent.childCount = matchedEvent.adultCount;
        matchedEvent.attending = matchedEvent.attending;
        resolve();
      }, 2000);
    })
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