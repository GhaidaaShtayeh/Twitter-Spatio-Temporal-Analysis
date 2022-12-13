// Import the necessary modules
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class StreamDataService {
  // Define the API endpoint
  API_ENDPOINT = 'http://localhost:5000/stream_data';

  constructor(private http: HttpClient) {}

  // Method to make a POST request to the API endpoint
  streamData(query: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(this.API_ENDPOINT, query, httpOptions);
  }
}
