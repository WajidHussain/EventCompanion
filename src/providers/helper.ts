import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import * as moment from 'moment';


@Injectable()
export class Helper {
  data: any;

  constructor() { }

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
        return "fa-pie-chart";
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
      case "ceremony": // todo
        return "fa-info-circle";
      case "sports":
        return "fa-trophy";
      case "service":
        return "fa-hand-peace-o";
      case "clinic":
        return "fa-stethoscope";
      case "missing":
        break;
      case "school":
        return "fa-university";
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
// {
//       "id":"102",
//       "rsvpStatus": "yes",
//       "adultCount": "2",
//       "childCount": "1"
//     },
//     {
//       "id":"104",
//       "rsvpStatus": "maybe",
//       "adultCount": "1",
//       "childCount": "0"
//     }