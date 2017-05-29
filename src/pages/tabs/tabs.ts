import { Component } from '@angular/core';

import { EventsPage } from '../events/events';
import { HomePage } from '../home/home';
import { AnnouncementsPage } from '../announcements/announcements'

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  currentIndex: number;
  tab1Root = HomePage;
  tab2Root = EventsPage;
  tab3Root = AnnouncementsPage

  constructor() {
    this.currentIndex = 0;
    
  }

  ionViewDidLoad() {
    document.querySelector('div.tabbar').className = 'tabbar show-tabbar';
    (<any>document.querySelector('div.tabbar')).style.bottom = "0px";
  }
}
