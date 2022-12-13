import { Query } from './../query';
import { Component, OnInit } from '@angular/core';
import { StreamDataService } from '../stream-data-service.service';

@Component({
  selector: 'app-stream-data',
  template: `
    <div>
      <h1>Tweet Data</h1>
      <ul>
        <li *ngFor="let tweet of tweets">
          <p>Created at: {{ tweet.created_at }}</p>
          <p>ID: {{ tweet.id }}</p>
          <p>Text: {{ tweet.text }}</p>
        </li>
      </ul>
    </div>
  `,
  styleUrls: ['./stream-data.component.css']
})
export class StreamDataComponent implements OnInit {
  tweets: any[] = [];
  query: Query = new Query;
  constructor(private streamDataService: StreamDataService) {}

  ngOnInit() {
    this.streamDataService.streamData(this.query)
      .subscribe(data => {
        console.log(data);
        this.tweets.push(data);
      });
  }
}
