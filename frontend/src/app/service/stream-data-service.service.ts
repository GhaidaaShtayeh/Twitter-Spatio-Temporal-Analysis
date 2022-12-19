import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StreamDataService {
  constructor(private http: HttpClient) {}


  streamData(query: any){
    console.log(query)
      return this.http.post('http://localhost:5000/stream_data', query)
  }
  allData(){
      return this.http.get('http://localhost:5000/all_data')
  }
}
