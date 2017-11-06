import { Component } from '@angular/core';
import { EventsPage } from '../events/events';
import { Platform, NavParams } from 'ionic-angular';
import { HomePage } from '../home/home';
import { AnnouncementsPage } from '../announcements/announcements'


@Component({
  templateUrl: 'tabs.html'
})

export class TabsPage {
  currentIndex: number;
  tabParams: any;
  tab1Root = HomePage;
  tab2Root = EventsPage;
  tab3Root = AnnouncementsPage

  constructor(private platform: Platform, public navParams: NavParams) {
    this.currentIndex = 0;
    // this.tabParams = { test: 1 };
    if (this.navParams) {
      this.tabParams = { id: this.navParams.get('id') };
      if (this.navParams.get('type') == 'announcement') {
        this.currentIndex = 1;
        this.tabParams.refresh = true;
      }
      if (this.navParams.get('type') == 'event') {
        this.currentIndex = 2;
        this.tabParams.refresh = true;        
      }
      // this.navParams.data['type'] = undefined;
      // this.navParams.data['id'] = undefined;
      // this.navParams.data['refresh'] = undefined;
    }
  }


  ionViewDidLoad() {
    document.querySelector('div.tabbar').className = 'tabbar show-tabbar';
    (<any>document.querySelector('div.tabbar')).style.bottom = "0px";
  }
}
