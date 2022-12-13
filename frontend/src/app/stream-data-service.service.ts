import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StreamDataService {
  constructor(private http: HttpClient) {}


  streamData(query: any): Observable<any> {
    return new Observable(observer => {
      this.http.post('http://localhost:5000/stream_data', query).subscribe(data => {
        // Stream the data out in chunks of 5 seconds
        for (const chunk of data) {
          setTimeout(() => {
            observer.next(chunk);
          }, 5000);
        }
      });
    });
  }
}
