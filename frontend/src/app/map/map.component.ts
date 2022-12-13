import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import * as leaflet from 'leaflet';
import 'heatmap.js';
import 'leaflet.heat';
import { GeoPoint } from '../model/geo-point';
import { Query } from '../model/query';
import { StreamDataService } from '../stream-data-service.service';

declare const HeatmapOverlay: any;
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent {
  private map: any;
  tweets = [];
  query: Query = new Query;
  public data: any[] = [];

  constructor(private streamDataService: StreamDataService) {}

  ngOnInit(): void {
    //const form = document.querySelector('form') as HTMLFormElement;
    //const formData = new FormData(form);
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
        this.tweets = data["data"];
        this.initMap();
      });
  }

  private initMap(): void {

    // Initialising map with center point by using the coordinates
    // Setting initial zoom to 3
    this.map = leaflet.map('map', {
      center: [ 39.8282, -98.5795 ],
      zoom: 3
    });


    // Initialising tiles to the map by using openstreetmap
    // Setting zoom levels
    const tiles = leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 28,
      minZoom: 0,
    });

    // Adding tiles to the map
    tiles.addTo(this.map);

    //Adding heat layer to a map
    this.tweets = this.tweets.filter(function (el) {
      return el['coordinates'] != null;
    });

    var new_data2 =this.tweets.map(function (p:any)  {
    return L.latLng(p["coordinates"]["coordinates"][1], p["coordinates"]["coordinates"][0]);
    });

    leaflet.heatLayer(
      new_data2
      ,
    {
      minOpacity: 0.5,
      radius: 25,
      blur: 15,
      maxZoom: 1,
      max: 1,
    }
    ).addTo(this.map);
    }
  }





