import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HttpModule } from '@angular/http';

import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { EventsPage } from '../pages/events/events';
import { AnnouncementsPage } from '../pages/announcements/announcements';
import { EventDetailPage } from '../pages/event-detail/event-detail';
import { EventsData } from '../providers/events-data';
import { AnnouncementsData } from '../providers/announcements-data';


import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    TabsPage,
    EventsPage,
    EventDetailPage,
    AnnouncementsPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,    
    HomePage,
    TabsPage,
    EventsPage,
    EventDetailPage,
    AnnouncementsPage
  ],
  providers: [
    EventsData,
    AnnouncementsData,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
