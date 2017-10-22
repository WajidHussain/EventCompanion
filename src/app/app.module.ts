import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HttpModule } from '@angular/http';
import { Calendar } from '@ionic-native/calendar';

import { HomePage, SafePipe } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { EventsPage } from '../pages/events/events';
import { AnnouncementsPage } from '../pages/announcements/announcements';
import { AnnouncementDetailPage } from '../pages/announcement-detail/announcement-detail';
import { EventDetailPage } from '../pages/event-detail/event-detail';
import { EventsData } from '../providers/events-data';
import { HomeData } from '../providers/home-data';
import { Helper } from '../providers/helper'
import { AnnouncementsData } from '../providers/announcements-data';
import { UserData } from '../providers/user-data';

import { PopoverPage } from '../pages/home-popover/home-popover';
import { SupportPage } from '../pages/support/support';
import { SettingsPage } from '../pages/settings/settings';
import { AboutPage } from '../pages/about/about';
import { LoginPage } from '../pages/login/login';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
// Import the AF2 Module
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { Facebook } from '@ionic-native/facebook';
import { FCM } from '@ionic-native/fcm';


// AF2 Settings
export const firebaseConfig = {
  apiKey: "AIzaSyBdspJiLkbPrNjOL_IVTaJPCmgzJpWpjv0",
  authDomain: "masjid-companion.firebaseapp.com",
  databaseURL: "https://masjid-companion.firebaseio.com",
  projectId: "masjid-companion",
  storageBucket: "masjid-companion.appspot.com",
  messagingSenderId: "861672505274"
};

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
    AboutPage,
    LoginPage,
    SafePipe
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule
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
    AboutPage,
    LoginPage
  ],
  providers: [
    Helper,
    HomeData,
    EventsData,
    AnnouncementsData,
    StatusBar,
    SplashScreen,
    Calendar,
    UserData,
    Facebook,
    FCM,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
