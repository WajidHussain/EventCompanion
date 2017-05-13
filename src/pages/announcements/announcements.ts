import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AnnouncementsData } from '../../providers/announcements-data';


@IonicPage()
@Component({
  selector: 'page-announcements',
  templateUrl: 'announcements.html',
})
export class AnnouncementsPage {
  public announcementList: any;


  constructor(public navCtrl: NavController, public navParams: NavParams, public announcementsData: AnnouncementsData) {
  }

  ionViewDidLoad() {
    this.announcementsData.getAnnouncements().subscribe((data: any) => {
      this.announcementList = data;
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
