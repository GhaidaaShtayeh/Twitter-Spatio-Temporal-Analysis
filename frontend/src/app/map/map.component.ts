import { Query } from './../model/query';
import { Component,  OnInit } from '@angular/core';
import * as leaflet from 'leaflet';
import 'heatmap.js';
import 'leaflet.heat';
import { GeoPoint } from '../model/geo-point';
import { StreamDataService } from '../stream-data-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

declare const HeatmapOverlay: any;
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit {
  private map: any;
  tweets = [];
  query: Query = new Query;
  public data: any[] = [];

  queryForm: FormGroup = this._formbuilder.group({
    keywords: ['', Validators.required],
    start_date: ['', Validators.required],
    end_date: ['', Validators.required],
    lat: ['', Validators.required],
    lon: ['', Validators.required],


});

  constructor(private _formbuilder: FormBuilder,
    private streamDataService: StreamDataService) {}


  ngOnInit(): void {
        this.initMap();
  }
  public onSave(){
    this.query.keywords = this.queryForm.get('keywords')?.value;
    this.query.start_date = this.queryForm.get('start_date')?.value;
    this.query.end_date = this.queryForm.get('end_date')?.value;
    this.query.coordinates = new GeoPoint
    this.query.coordinates!.latitude = this.queryForm.get('lat')?.value;
    this.query.coordinates!.longitude = this.queryForm.get('lon')?.value;
    this.streamDataService.streamData(this.query)
      .subscribe(data => {
        this.tweets = data["data"];
        this.initHeatMap()
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
    }

    private initHeatMap(): void {
      
      this.map.off();
      this.map.remove();
      this.initMap()

      //Adding heat layer to a map
      this.tweets = this.tweets.filter(function (el) {
        return el['coordinates'] != null;
      });

     var new_data2 =this.tweets.map(function (p:any)  {
      return leaflet.latLng(p["coordinates"]["coordinates"][1], p["coordinates"]["coordinates"][0]);
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





