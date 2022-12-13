import { Query } from '../model/query';
import { Component, OnInit } from '@angular/core';
import { StreamDataService } from '../stream-data-service.service';
import { GeoPoint } from '../model/geo-point';

@Component({
  selector: 'app-stream-data',
  templateUrl: './stream-data.component.html',
  styleUrls: ['./stream-data.component.css']
})
export class StreamDataComponent implements OnInit {
  tweets: any[] = [];
  query: Query = new Query;
  constructor(private streamDataService: StreamDataService) {}

  ngOnInit() {
    const form = document.querySelector('form') as HTMLFormElement;
    const formData = new FormData(form);
    this.query.keywords = "Ringing"
    // formData.get('keywords') as string;
    this.query.start_date = "2013-12-31T07:14:22+00:00"
    // formData.get('start_date') as string;
    this.query.end_date = "2020-12-31T07:14:22+00:00"
    this.query.coordinates = new GeoPoint
    //formData.get('end_date') as string;
    this.query.coordinates!.latitude = -78.96225
    //formData.get('lat') as unknown as Float32Array;
    this.query.coordinates!.longitude = 100.4083
    //formData.get('lon') as unknown as Float32Array;

    this.streamDataService.streamData(this.query)
      .subscribe(data => {
        console.log(data);
        this.tweets.push(data);
      });
  }
}
