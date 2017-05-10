import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, List } from 'ionic-angular';
import { EventsData } from '../../providers/events-data';
import { EventDetailPage } from '../event-detail/event-detail';

/**
 * Generated class for the Events page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-events',
  templateUrl: 'events.html',
})
export class EventsPage {
  @ViewChild('eventList', { read: List }) eventList: List;
  public events: EventsData;
  public category: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public eventsData: EventsData) {
    this.category = "upcoming";
  }

  ionViewDidLoad() {
    this.updateEventList();
  }

  updateEventList() {
    this.eventsData.getEvents(this.category).subscribe((data: any) => {
      this.events = data;
    });
  }

  goToEventDetail(event: Event) {
    // go to the session detail page
    // and pass in the session data
    this.navCtrl.push(EventDetailPage, {
      name: event.id,
      session: event
    });
  }

}

export interface Event {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
}

export interface EventDetail {
  id: string;
  title: string;
  description: string;
  speakers: Array<string>;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  allowRsvp?: boolean;
  adultHeadCount?: boolean;
  childrenHeadCount?: boolean;
  headCount?: number;
  location: string;
}

