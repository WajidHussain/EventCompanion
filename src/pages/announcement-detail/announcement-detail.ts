import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AnnouncementsData } from '../../providers/announcements-data';
import * as moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-announcement-detail',
  templateUrl: 'announcement-detail.html',
})
export class AnnouncementDetailPage {
  announcement: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public announcementData: AnnouncementsData) {
    this.announcementData.getAnnouncementDetails(navParams.data.name).subscribe((data) => {
      if (data) {
        this.announcement = Object.assign({}, data);
        this.announcement.timestamp = moment(this.announcement.timestamp).from(new Date());
        this.announcementData.updateEventRead(this.announcement.id);
      }
    });
  }


}
