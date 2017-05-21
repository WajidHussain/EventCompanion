import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import { EventsData } from '../../providers/events-data';
import { UserData } from '../../providers/user-data';
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
    public eventsData: EventsData, public loadingCtrl: LoadingController,
    public toastCtrl: ToastController, public userData: UserData) {
    this.eventsData.getEventDetails(navParams.data.name).subscribe((data) => {
      this.event = Object.assign({}, data);
      if (Date.now() - <any>(new Date(this.event.endDateTime)) > 0) {
        this.event.past = true;
      } else {
        this.event.past = false;
      }
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
    this.userData.getUserSettings().subscribe((data) => {
      if (data.calendarUpdate) {
        this.calendar.hasReadWritePermission().then((result) => {
          if (result) {
            this.handleCreateOrRemove();
          } else {
            this.calendar.requestReadWritePermission().then(() => {
              this.handleCreateOrRemove();
            }).catch(() => {
              this.presentToast('Access denied!');
            })
          }
        }).catch(() => {
          this.presentToast('There was a problem updating your calendar.');
        });
      }
    })

  }

  handleCreateOrRemove() {
    if (this.event.attending) {
      this.createEvent();
    } else {
      this.removeEvent();
    }
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

  removeEvent() {
    this.calendar.deleteEvent(this.event.title, this.event.location, "",
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
