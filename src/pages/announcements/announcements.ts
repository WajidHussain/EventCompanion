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
    this.updateList();
  }

  updateList() {
    this.dataLoading = true;
    let loading = this.loadingCtrl.create({
      content: "Loading.."
    });
    loading.present();
    this.announcementsData.getAnnouncements().subscribe((data: any) => {
      this.announcementList = data;
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

  goToAnnouncementDetail(item: any) {
    if (this.helper.isUserSignedIn()) {
      this.navCtrl.push(AnnouncementDetailPage, {
        name: item.id
      });
    } else {
      this.toastCtrl.create({
        message: 'Please sign in to continue..',
        duration: 2000
      }).present();
    }
  }

  doRefresh(refresher) {
    this.announcementsData.getAnnouncements(true).subscribe((data: any) => {
      this.announcementList = data;
      setTimeout(() => {
        refresher.complete();
      }, 500);
    });
  }

}
