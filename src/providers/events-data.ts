import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';


@Injectable()
export class EventsData {
  data: any;

  constructor(public http: Http) { }

  load(): any {
    if (this.data) {
      return Observable.of(this.data);
    } else {
      return this.http.get('assets/data/data.json')
        .map(this.processData, this);
    }
  }

  processData(data: any) {
    // just some good 'ol JS fun with objects and arrays
    // build up the data by linking speakers to sessions
    this.data = data.json();
    this.data.events = this.data && this.data.events;
    this.data.subscriptions = this.data && this.data.subscriptions;
    return this.data;
  }

  public getEvents(category: string) {
    if (category === "upcoming") {
      return this.getUpcomingEvents();
    } else if (category === "attending") {
      return this.getAttendingEvents();
    } else {

    }
  }

  // getEventSubscription(subscriptionId: string) {
  //   return this.load().map((items) => {
  //     let matchedSubscription = this.data.subscriptions.find((item) => {
  //       return item.id === subscriptionId;
  //     });
  //     return matchedSubscription;
  //   });
  // }

  getAttendingEvents() {
    return this.load().map((items) => {
      let events = [];
      items.events.forEach(item => {
        let subscription = this.findSubscriptionById(item.id);
        if (subscription) {
          events.push({
            id: item.id,
            title: item.title,
            startDate: item.startDate,
            endDate: item.endDate,
            startTime: item.startTime,
            endTime: item.endTime,
            location: item.location
          });
        }
      });
      return events;
    });
  }

  getUpcomingEvents() {
    return this.load().map((items) => {
      let events = [];
      items.events.forEach(item => {
        events.push({
          id: item.id,
          title: item.title,
          startDate: item.startDate,
          endDate: item.endDate,
          startTime: item.startTime,
          endTime: item.endTime,
          location: item.location
        });
      });
      return events;
    });
  }

  getEventDetails(eventId: string) {
    return this.load().map((items) => {
      let matchedEvent = this.data.events.find((item) => {
        return item.id === eventId;
      });
      let matchedSubscription = this.data.subscriptions.find((item) => {
        return item.id === eventId;
      });
      if (matchedEvent.allowRsvp) {
        Object.assign(matchedEvent, matchedSubscription);
        // set default status
        matchedEvent.rsvpStatus = matchedEvent.rsvpStatus ? matchedEvent.rsvpStatus : "no";
        matchedEvent.adultCount = matchedEvent.adultCount ? matchedEvent.adultCount : 0;
        matchedEvent.childCount = matchedEvent.childCount ? matchedEvent.childCount : 0;
      }
      return matchedEvent;
    });
  }

  findSubscriptionById(eventId: string) {
    return this.data.subscriptions.find((item) => {
      return item.id === eventId;
    });
  }

  mapEventList() {

  }

}
