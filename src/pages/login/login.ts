import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { Helper } from '../../providers/helper';
import * as firebase from 'firebase/app';

/**
 * Generated class for the Login page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  private signedIn: boolean;
  private email: string;
  private password: string;
  private errorMsg: string;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private helper: Helper, public loadingCtrl: LoadingController, public toastCtrl: ToastController) {
    if (this.helper.isUserSignedIn()) {
      this.signedIn = true;
    } else {
      this.signedIn = false;
    }
  }

  logout() {
    let loading = this.loadingCtrl.create({
      content: "Signing out.."
    });
    loading.present();
    firebase.auth().signOut().then(() => {
      this.signedIn = false;
      this.helper.unsetuser();
      loading.dismiss();
      this.toastCtrl.create({
        message: "You're signed out",
        duration: 2000
      }).present();
      this.navCtrl.popToRoot();

    }).catch(error => {
    });
  }

  login() {
    let loading = this.loadingCtrl.create({
      content: "Signing in.."
    });
    loading.present();
    firebase.auth().signInWithEmailAndPassword(this.email, this.password)
      .then((user: firebase.User) => {
        this.helper.setUser(user);
        this.signedIn = true;
        this.toastCtrl.create({
          message: "You're signed in",
          duration: 2000
        }).present();
        this.navCtrl.popToRoot();
        loading.dismiss();
      })
      .catch((error: any) => {
        if (error.code === 'auth/user-not-found') {
          this.createUser(loading);
          return;
        }
        switch (error.code) {
          case 'auth/invalid-email':
            this.errorMsg = 'Invalid email';
            break;
          case 'auth/wrong-password':
            this.errorMsg = 'Incorrect password';
            break;
          default:
            this.errorMsg = 'Error occurred';
            break;
        }
        loading.dismiss();
        this.toastCtrl.create({
          message: this.errorMsg,
          duration: 2000
        }).present();
      });
  }

  createUser(loading: any) {
    firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
      .then((result: firebase.User) => {
        loading.dismiss();
        this.toastCtrl.create({
          message: "Profile created!",
          duration: 2000
        }).present();
        this.navCtrl.popToRoot();
      }).catch((error: any) => {
        switch (error.code) {
          case 'auth/invalid-email':
            this.errorMsg = 'Invalid email';
            break;
          case 'auth/email-already-in-use':
            this.errorMsg = 'Email address already in use';
            break;
          case 'auth/weak-password':
            this.errorMsg = 'Weak password';
            break;
          default:
            this.errorMsg = 'Error occurred';
            break;
        }
        loading.dismiss();
        this.toastCtrl.create({
          message: this.errorMsg,
          duration: 2000
        }).present();
      })
  }


}
