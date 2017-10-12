import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, ToastController } from 'ionic-angular';
import { HomeData } from '../../providers/home-data';
import { UserData } from '../../providers/user-data';
import { PopoverPage } from '../home-popover/home-popover';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  homePicture: string;
  prayerData: any;
  dataLoading: boolean;

  constructor(public navCtrl: NavController, public homeData: HomeData, public popoverCtrl: PopoverController
    , public loadingCtrl: LoadingController, public toastCtrl: ToastController,
    public userData: UserData) {
    this.homePicture = "http://www.redmondmosque.org/wp-content/uploads/2015/11/Prophet-Muhammad.jpg";
    // this.loadPrayerTimes();
    // this.userData.load().subscribe();
  }

  loadPrayerTimes() {
    this.dataLoading = true;
    let loading = this.loadingCtrl.create({
      content: "Loading.."
    });
    loading.present();
    this.homeData.readPrayerTimes().then((data) => {
      this.prayerData = data;
      loading.dismiss();
      this.dataLoading = false;
    }).catch(() => {
      loading.dismiss();
      this.dataLoading = false;
      this.toastCtrl.create({
        message: 'There was a problem loading data, please try again!',
        duration: 2000
      }).present();
    });
  }

  presentPopover(event: Event) {
    let popover = this.popoverCtrl.create(PopoverPage);
    popover.present({ ev: event });
  }

}
