import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import { EventsData } from '../../providers/events-data';

@IonicPage()
@Component({
  selector: 'page-event-detail',
  templateUrl: 'event-detail.html',
})

export class EventDetailPage {
  event: any;
  events: EventsData;
  isDirty: boolean;
  // event: any;
  selectOptions: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public eventsData: EventsData, public loadingCtrl: LoadingController, public toastCtrl: ToastController) {
    this.eventsData.getEventDetails(navParams.data.name).subscribe((data) => {
      this.event = Object.assign({}, data);
      this.selectOptions = { mode: 'md', buttons: [] };
      this.isDirty = false;
      this.eventsData.updateEventRead(this.event.id);
    });
  }

  ionViewDidLoad() {

  }

  incrementCounter(counterType: any) {
    if (counterType === "adult") {
      this.event.adultCount++;
      this.isDirty = true;
    } else {
      this.event.childCount++;
      this.isDirty = true;
    }
  }

  onAttendingChange(){
    this.isDirty = true;
  }

  decrementCounter(counterType: any) {
    if (counterType === "adult" && this.event.adultCount !== 0) {
      this.event.adultCount--;
      this.isDirty = true;
    } else if (counterType === "child" && this.event.childCount !== 0) {
      this.event.childCount--;
      this.isDirty = true;
    }
  }

  onRsvpChange(event: any) {
    this.event.rsvpStatus = event;
    this.isDirty = true;
  }

  submit() {
    // take back to home??
    let loading = this.loadingCtrl.create({
      content: "Updating your RSVP.."
    });
    loading.present();
    this.eventsData.submit(this.event).then(() => {
      loading.dismiss();
      this.toastCtrl.create({
        message: 'Your response is recorded!',
        duration: 2000
      }).present();
    }, () => {
      loading.dismiss();
      this.toastCtrl.create({
        message: 'There was a problem reaching server. Please try again!',
        duration: 2000
      }).present();
    });
  }
}
