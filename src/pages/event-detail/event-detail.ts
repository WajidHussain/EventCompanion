import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { EventsData } from '../../providers/events-data';

@IonicPage()
@Component({
  selector: 'page-event-detail',
  templateUrl: 'event-detail.html',
})

export class EventDetailPage {
  event: any;
  events: EventsData;
  // event: any;
  selectOptions: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public eventsData: EventsData) {
    // this.event = navParams.data.session;
    this.eventsData.getEventDetails(navParams.data.name).subscribe((data) => {
      this.event = data;
      this.selectOptions = { mode: 'md', buttons: [] };
    });
  }

  ionViewDidLoad() {

  }

  incrementCounter(counterType: any) {
    if (counterType === "adult") {
      this.event.adultCount++;
    } else {
      this.event.childCount++;
    }
  }

  decrementCounter(counterType: any) {
    if (counterType === "adult" && this.event.adultCount !== 0) {
      this.event.adultCount--;
    } else if (counterType === "child" && this.event.childCount !== 0) {
      this.event.childCount--;
    }
  }
}
