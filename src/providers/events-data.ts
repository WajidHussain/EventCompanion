import { Injectable } from '@angular/core';

import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import * as moment from 'moment';


@Injectable()
export class EventsData {
  data: any;

  constructor(public http: Http) { }

  load(): any {
    if (this.data) {
      return Observable.of(this.data);
    } else {
      return this.http.get('assets/data/events-data.json')
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
        if (subscription) {
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
    else if (moment(item.startDateTime).week() === moment().week()) {
      eventList[2].events.push(this.createEventListItem(item));
    }
    else if (moment(item.startDateTime).week() - moment().week() == 1) {
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
      font: this.setFont(item.category)
    };
  }

  setFont(category: string): string {
    if (!category)
      return "fa-info";
    switch (category.toLowerCase()) {
      case "potluck":
        return "fa-pie-chart";
      case "halaqa":
        return "fa-users";
      case "visitingscholar":
        return "fa-graduation-cap";
      case "fundraiser":
        return "fa-money";
      case "food":
        return "fa-cutlery";
      case "workshop":
        return "fa-cogs";
      case "ceremony":

        break;
      case "sports":
        return "fa-trophy";
      case "service":
        return "fa-hand-peace-o";
      case "missing":
        break;
      case "school":
        return "fa-university";
      case "videorecording":
        return "fa-video-camera";
      case "moonsight":
        return "fa-moon-o";
      case "volunteer":
        return "fa-hand-paper-o";
      default:
        return "fa-info";
    }
  }

  prependZero(value: number): string {
    if (typeof value === "number" && value < 10 && value > -1) {
      return "0" + value;
    }
    return value.toString();
  };

  getEventDetails(eventId: string) {
    return this.load().map((items) => {
      let matchedEvent = this.findEventById(eventId);
      let matchedSubscription = this.findSubscriptionById(eventId);
      if (moment(matchedEvent.startDateTime).format("D") === moment(matchedEvent.endDateTime).format("D")) {
        matchedEvent.startTime = moment(matchedEvent.startDateTime).format("ddd MMM Do hh:mm A");
        matchedEvent.endTime = moment(matchedEvent.endDateTime).format("hh:mm A");
      } else {
        matchedEvent.startTime = moment(matchedEvent.startDateTime).format("MMM DD hh:mm A");
        matchedEvent.endTime = moment(matchedEvent.endDateTime).format("MMM DD hh:mm A");
      }
      if (matchedEvent.allowRsvp) {
        Object.assign(matchedEvent, matchedSubscription);
        // set default status
        matchedEvent.rsvpStatus = matchedEvent.rsvpStatus;
        matchedEvent.adultCount = matchedEvent.adultCount ? matchedEvent.adultCount : 0;
        matchedEvent.childCount = matchedEvent.adultCount ? matchedEvent.childCount : 0;
      }
      return matchedEvent;
    });
  }

  updateEventRead(eventId: string) {
    this.findEventById(eventId).read = true;
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

  updateRsvp(event: any): Promise<boolean> {
    return new Promise((resolve: any, reject: any) => {
      window.setTimeout(() => {
        let subscription = this.findSubscriptionById(event.id);
        if (!subscription) {
          this.data.eventSubscriptions.push({
            id: event.id,
            rsvpStatus: event.rsvpStatus,
            adultCount: event.adultCount,
            childCount: event.childCount
          });
        } else {
          subscription.rsvpStatus = event.rsvpStatus;
          subscription.adultCount = event.adultCount;
          subscription.childCount = event.childCount;
        }
        resolve();
      }, 2000);
    })
  }

}
