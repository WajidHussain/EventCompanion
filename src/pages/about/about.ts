import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  submitted: boolean = false;
  supportMessage: string;

  constructor( ) {

  }


}
