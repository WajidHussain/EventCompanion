import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, List, LoadingController, ToastController } from 'ionic-angular';
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
  public eventCollection: EventsData;
  public category: string;
  public dataLoading: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams
    , public loadingCtrl: LoadingController, public toastCtrl: ToastController, 
    public eventsData: EventsData) {
    this.category = "upcoming";
  }

  ionViewDidLoad() {
  }

  ionViewDidEnter(a: any) {
    this.updateEventList();
  }

  updateEventList() {
    this.dataLoading = true;
    let loading = this.loadingCtrl.create({
      content: "Loading.."
    });
    loading.present();
    this.eventsData.getEvents(this.category).subscribe((data: any) => {
      this.eventCollection = data;
      loading.dismiss();
      this.dataLoading = false;
    }, () => {
      this.dataLoading = false;  
      loading.dismiss();    
      this.toastCtrl.create({
        message: 'There was a problem loading data, please try again!',
        duration: 2000
      }).present();
    });
  }

  doRefresh(refresher) {
    // this should do a hard refresh?? test it when connected to server
    // check if the getEvents call fails
    this.eventsData.getEvents(this.category).subscribe((data: any) => {
      this.eventCollection = data;
      setTimeout(() => {
        refresher.complete();
      }, 500);
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

