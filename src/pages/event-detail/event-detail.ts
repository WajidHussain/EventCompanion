import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import { EventsData } from '../../providers/events-data';
import { Calendar } from '@ionic-native/calendar';

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

  constructor(public navCtrl: NavController, public navParams: NavParams, private calendar: Calendar,
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

  onAttendingChange() {
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
      this.presentToast('Your response is recorded!');
      this.updateCalendar();
      this.isDirty = false;
    }, () => {
      loading.dismiss();
      this.presentToast('There was a problem reaching server. Please try again!');
    });
  }

  updateCalendar() {
    this.calendar.hasReadWritePermission().then((result) => {
      if (result) {
        this.createEvent();
      } else {
        this.calendar.requestReadWritePermission().then(() => {
          this.createEvent();
        }).catch(() => {
          this.presentToast('Access denied!');
        })
      }
    }).catch(() => {
      this.presentToast('There was a problem updating your calendar.');
    });
  }

  createEvent() {
    this.calendar.createEvent(this.event.title, this.event.location, "",
      new Date(this.event.startDateTime), new Date(this.event.endDateTime))
      .then(() => {
        this.presentToast('Calendar updated!');
      }).catch(() => {
        this.presentToast('There was a problem creating event in your calendar.');
      });
  }

  presentToast(message: string, duration = 2000) {
    this.toastCtrl.create({
      message: message,
      duration: duration
    }).present();
  }
}
