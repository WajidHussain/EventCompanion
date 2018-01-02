import { Component, ViewChild } from '@angular/core';
import { IonicPage, List, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { AnnouncementsData } from '../../providers/announcements-data';
import { Helper } from '../../providers/helper';
import { AnnouncementDetailPage } from '../announcement-detail/announcement-detail';


@IonicPage()
@Component({
  selector: 'page-announcements',
  templateUrl: 'announcements.html',
})
export class AnnouncementsPage {
  @ViewChild('announcementCollection', { read: List }) announcementCollection: List;
  public announcementList: any;
  public dataLoading: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public announcementsData: AnnouncementsData, public loadingCtrl: LoadingController,
    public toastCtrl: ToastController, public helper: Helper) {
  }

  ionViewDidEnter() {
    if (this.navParams.get('id')) {
      this.goToAnnouncementDetail({ id: this.navParams.get('id') });
    }
    else {
      this.updateList();
    }
    this.navParams.data["id"] = undefined;
  }

  updateList(defaultRefresh = false) {
    let loading = this.loadingCtrl.create({
      content: "Loading.."
    });
    if (!this.announcementList) {
      this.dataLoading = true;
      loading.present();
    }
    this.announcementsData.getAnnouncements(defaultRefresh).subscribe((data: any) => {
      if (!this.announcementList) {
        loading.dismiss();
        this.dataLoading = false;
      }
      this.sortAndSet(data);
    }, () => {
      this.dataLoading = false;
      loading.dismiss();
      this.toastCtrl.create({
        message: 'There was a problem loading data, please try again!',
        duration: 2000
      }).present();
    });
  }

  sortAndSet(data: any) {
    this.announcementList = data.sort((a: any, b: any) => {
      return <any>(new Date(<number>(b.timestamp))) - <any>(new Date(a.timestamp));
    });
  }

  goToAnnouncementDetail(item: any) {
    if (this.helper.isUserSignedIn()) {
      this.navCtrl.push(AnnouncementDetailPage, {
        name: item.id
      });
    } else {
      this.toastCtrl.create({
        message: 'Please sign in from Home tab to continue..',
        duration: 2000
      }).present();
    }
  }

  doRefresh(refresher) {
    this.announcementsData.getAnnouncements(true).subscribe((data: any) => {
      this.sortAndSet(data);
      setTimeout(() => {
        refresher.complete();
      }, 500);
    });
  }

}
