/// <reference path="../../node_modules/firebase/firebase.d.ts" />


import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import * as moment from 'moment';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Platform } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';


@Injectable()
export class Helper {

  public Mock = false;
  public loggedInUser: firebase.User;

  constructor(private afAuth: AngularFireAuth, public platform: Platform
    , private fb: Facebook) {
    // this.subscribe();
    // this.afAuth.auth()
  }

  subscribe() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.loggedInUser = user;
      } else {
        // No user is signed in.
      }
  
    });

  }

  isUserSignedIn() {
    if (this.loggedInUser) {
      return !this.loggedInUser.isAnonymous;
    } else {
      return false;
    }
  }

  setUser(user: firebase.User) {
    this.loggedInUser = user;
  }

  unsetuser() {
    this.loggedInUser = undefined;
  }

  getLoggedInUser() {
    return this.loggedInUser;
  }


  getToken(): any {
    return new Promise((resolve) => {
      if (this.loggedInUser) {
        resolve(this.loggedInUser.uid);
      }
      else {
        setTimeout(() => {
          resolve((this.loggedInUser && this.loggedInUser.uid) || "");
        }, 2000);
      }
    });
    // firebase.auth().app.database()
    // //return firebase.auth().signInWithCustomToken(this.loggedInUser.getToken();
    // return this.loggedInUser.getIdToken().then(token => {
    //   return firebase.auth().signInWithCustomToken(token);
    // });
  }

  // loginWithGoogle() {
  //   if (this.platform.is('cordova')) {
  //     alert('cordi');
  //     // First, we perform the signInWithRedirect.
  //     // Creates the provider object.
  //     var provider = new firebase.auth.FacebookAuthProvider();
  //     // You can add additional scopes to the provider:
  //     provider.addScope('email');
  //     provider.addScope('user_friends');
  //     // Sign in with redirect:
  //     firebase.auth().signInWithRedirect(provider)
  //       .then(result => {
  //         alert(result.user);
  //       }).catch(error => {
  //         alert(error);
  //       });
  //     // return this.fb.login(['email', 'public_profile']).then((res) => {
  //     //   firebase.auth().signInWithCredential(firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken))
  //     //   // .then((user: firebase.User) => {
  //     //   //   alert(user.displayName);
  //     //   // });
  //     // });
  //   } else {
  //     // provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
  //     this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
  //       .then((result: any) => {
  //         //let token = result.credential.accessToken;
  //         // The signed-in user info.
  //         let user = result.user;
  //         alert(user);
  //       }).catch(() => {
  //         alert('err');
  //       });
  //   }
  // }

  createEventListItem(item) {
    return {
      id: item.id,
      title: item.title,
      startTime: moment(item.startDateTime).format("hh:mm A"),
      endTime: moment(item.endDateTime).format("hh:mm A"),
      location: item.location,
      category: item.category,
      read: item.read === undefined ? false : item.read,
      font: this.getFont(item.category)
    };
  }

  getFont(category: string): string {
    if (!category)
      return "fa-info-circle";
    switch (category.toLowerCase()) {
      case "potluck":
        return "fa-cutlery";
      case "halaqa":
        return "fa-users";
      case "visitingscholar":
        return "fa-graduation-cap";
      case "fundraiser":
        return "fa-money";
      case "food":
        return "fa-cutlery";
      case "workshop":
        return "fa-cogs";
      case "ceremony":
        return "fa-snowflake-o";
      case "women":
        return "fa-female";
      case "sports":
        return "fa-trophy";
      case "service":
        return "fa-hand-peace-o";
      case "clinic":
        return "fa-stethoscope";
      case "missing":
        break;
      case "school":
        return "fa-graduation-cap";
      case "videorecording":
        return "fa-video-camera";
      case "moonsight":
        return "fa-moon-o";
      case "volunteer":
        return "fa-hand-paper-o";
      case "timechange":
        return "fa-clock-o";
      default:
        return "fa-info-circle";
    }
  }

}