import { Component, ViewChild } from '@angular/core';
import { IonicPage, List, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { AnnouncementsData } from '../../providers/announcements-data';
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
    public announcementsData: AnnouncementsData, public loadingCtrl: LoadingController, public toastCtrl: ToastController) {
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
    this.navCtrl.push(AnnouncementDetailPage, {
      name: item.id
    });
  }

  doRefresh(refresher) {
    this.announcementsData.getAnnouncements().subscribe((data: any) => {
      this.announcementList = data;
      setTimeout(() => {
        refresher.complete();
      }, 500);
    });
  }

}
