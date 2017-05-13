import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';


@Injectable()
export class AnnouncementsData {
  data: any;

  constructor(public http: Http) { }

  load(): any {
    if (this.data) {
      return Observable.of(this.data);
    } else {
      return this.http.get('assets/data/announcements-data.json')
        .map(this.processData, this);
    }
  }

  processData(data: any) {
    // just some good 'ol JS fun with objects and arrays
    // build up the data by linking speakers to sessions
    this.data = data.json();
    this.data.announcements = this.data && this.data.announcements;
    return this.data;
  }

  public getAnnouncements() {
    return this.load().map((items) => {
      let announcements = [];
      this.data.announcements.forEach((item) => {
        announcements.push({ title: item.title, location: item.location, isRead: item.isRead
        , description: item.description, category: item.category, color: item.color });
      });
      return announcements;
    });
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
        this.categorizeEventsPerDay(item, eventList);
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
    else if
        (new Date(item.endDateTime).getDate() - (new Date().getDate() + new Date().getDay()) <= 0) {
      eventList[2].events.push(this.createEventListItem(item));
    }
    else if (new Date(item.endDateTime).getDate() - (new Date().getDate() + new Date().getDay()) <= 7) {
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
      startTime: this.prependZero(new Date(item.startDateTime).getHours()) + ":" +
      this.prependZero(new Date(item.startDateTime).getMinutes()),
      endTime: this.prependZero(new Date(item.endDateTime).getHours()) + ":" +
      this.prependZero(new Date(item.endDateTime).getMinutes()),
      location: item.location
    };
  }

  prependZero(value: number): string {
    if (typeof value === "number" && value < 10 && value > -1) {
      return "0" + value;
    }
    return value.toString();
  };

  getEventDetails(eventId: string) {
    return this.load().map((items) => {
      let matchedEvent = this.data.events.find((item) => {
        return item.id === eventId;
      });
      let matchedSubscription = this.data.subscriptions.find((item) => {
        return item.id === eventId;
      });
      matchedEvent.startTime = this.prependZero(new Date(matchedEvent.startDateTime).getHours()) + ":" +
        this.prependZero(new Date(matchedEvent.startDateTime).getMinutes());
      matchedEvent.endTime = this.prependZero(new Date(matchedEvent.endDateTime).getHours()) + ":" +
        this.prependZero(new Date(matchedEvent.endDateTime).getMinutes());
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
