import { Component } from '@angular/core';
import { StreamDataService } from '../stream-data-service.service';

@Component({
  selector: 'app-stream-data',
  templateUrl: './stream-data.component.html',
  styleUrls: ['./stream-data.component.css']
})
export class StreamDataComponent{

  data: any;

  constructor(private streamDataService: StreamDataService) {
    this.streamDataService.streamData(this.data)
      .subscribe(response => {
        // Print the data results in the console
        console.log(response);
        this.data = response;
      });
  }
}
