import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HttpModule } from '@angular/http';

import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { EventsPage } from '../pages/events/events';
import { AnnouncementsPage } from '../pages/announcements/announcements';
import { AnnouncementDetailPage } from '../pages/announcement-detail/announcement-detail';
import { EventDetailPage } from '../pages/event-detail/event-detail';
import { EventsData } from '../providers/events-data';
import { HomeData } from '../providers/home-data';
import { Helper } from '../providers/helper'
import { AnnouncementsData } from '../providers/announcements-data';
import { PopoverPage } from '../pages/home-popover/home-popover';
import { SupportPage } from '../pages/support/support';
import { SettingsPage } from '../pages/settings/settings';
import { AboutPage } from '../pages/about/about';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    TabsPage,
    EventsPage,
    EventDetailPage,
    AnnouncementsPage,
    AnnouncementDetailPage,
    PopoverPage,
    SupportPage,
    SettingsPage,
    AboutPage
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
    AnnouncementsPage,
    AnnouncementDetailPage,
    PopoverPage,
    SupportPage,
    SettingsPage,
    AboutPage
  ],
  providers: [
    Helper,
    HomeData,
    EventsData,
    AnnouncementsData,
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
