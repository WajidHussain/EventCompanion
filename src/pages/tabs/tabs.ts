import { Component } from '@angular/core';

import { EventsPage } from '../events/events';
import { HomePage } from '../home/home';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = EventsPage;

  constructor() {

  }
}
