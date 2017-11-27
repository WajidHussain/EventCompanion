import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, ToastController } from 'ionic-angular';
import { HomeData } from '../../providers/home-data';
import { UserData } from '../../providers/user-data';
import { DomSanitizer } from '@angular/platform-browser';
import { Pipe, PipeTransform } from '@angular/core';
import { PopoverPage } from '../home-popover/home-popover';
import { Observable } from 'rxjs/Observable';

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }
  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  homePageUrl: any;
  masjidName = "Islamic Center Of Redmond";

  constructor(public navCtrl: NavController, public homeData: HomeData, public popoverCtrl: PopoverController
    , public loadingCtrl: LoadingController, public toastCtrl: ToastController,
    public userData: UserData, public sanitizer: DomSanitizer) {
    this.loadData();
    this.userData.mySubject.subscribe((value) => {
      this.loadData();
    });
  }

  loadData() {
    let url = "";
    let loading = this.loadingCtrl.create({
      content: "Loading.."
    });
    loading.present();
    this.userData.getUserSettings().subscribe((data) => {
      if (data.masjids && data.settings && data.settings.homeMasjid) {
        let masjid = data.masjids.find(item => item.id === data.settings.homeMasjid);
        if (masjid) {
          url = masjid.val.url;
          this.masjidName = masjid.val.title;
        }
      }
      if (!url) {
        url = "http://www.redmondmosque.org";
      }
      Observable.timer(700).subscribe(() => {
        this.homePageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        loading.dismiss();
      });
    });
  }

  presentPopover(event: Event) {
    let popover = this.popoverCtrl.create(PopoverPage);
    popover.present({ ev: event });
  }

}
