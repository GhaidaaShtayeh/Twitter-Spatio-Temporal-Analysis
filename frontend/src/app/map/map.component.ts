import { Query } from './../model/query';
import { Component,  OnInit } from '@angular/core';
import * as leaflet from 'leaflet';
import 'heatmap.js';
import 'leaflet.heat';
import { GeoPoint } from '../model/geo-point';
import { StreamDataService } from '../service/stream-data-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import 'leaflet-area-select';
import * as $ from 'jquery';
import 'jquery-ui/ui/widgets/datepicker';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

// Create a new class for the map component that implements the OnInit interface
export class MapComponent implements OnInit {
  // Declare a variable for the map and initialize it as null
  private map: any = null;

  heatLayer : any =null;
  // Declare a variable for the tweets data
  tweets = [];

  // Declare a variable for the query object
  query: Query = new Query;

  // Declare a variable for the heatmap data
  public data: any[] = [];

  private areaSelect: any;

  // Declare a variable for the form group using the FormBuilder
  queryForm: FormGroup = this._formbuilder.group({
  keywords: ['', Validators.required],
  start_date: [''],
  end_date: [''],
  lat: [''],
  lon: [''],
  });

  // Inject the FormBuilder and StreamDataService in the constructor
  constructor(private _formbuilder: FormBuilder, private streamDataService: StreamDataService) {}

  // Implement the ngOnInit method to initialize the map when the component is loaded
  ngOnInit(): void {
    $('#startdatepicker').datepicker({
      theme: 'base',
      onSelect: (date) => {
        const newDate = new Date(date);
        this.query.start_date = newDate.toISOString();
      }
    });
    $('#enddatepicker').datepicker({
      theme: 'base',
      onSelect: (date) => {
        const newDate = new Date(date);
        this.query.end_date = newDate.toISOString();
      },
    });
  this.initMap();
  this.mapClicked();

  }

  // Create a method to handle the form submission
  public onSave(){
  // Set the query object properties from the form values


  this.query.keywords = this.queryForm.get('keywords')?.value;
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
      zoom: 3,

    });
  //this.areaSelect = leaflet.areaSelect();

    // Add the area select layer to the map
    //this.areaSelect.addTo(this.map);

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

      if(this.heatLayer != null ){
        this.map.removeLayer(this.heatLayer);
      }

      //Adding heat layer to a map
      this.tweets = this.tweets.filter(function (el) {
        return el['coordinates'] != null;
      });

      console.log(this.tweets)

      // Extract coordinates from data
     var new_data2 =this.tweets.map(function (p:any)  {
      return leaflet.latLng(p["coordinates"]["coordinates"][1], p["coordinates"]["coordinates"][0]);
      });
      // Add heatmap layer
      this.heatLayer = leaflet.heatLayer(
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

    mapClicked(){
      var current = this
      this.map.on("click",function(e){
        var location = e.latlng;
        var filtered_data = current.tweets.filter(function (el) {
          var distance = current.get_distance(
            location.lat,
            location.lng,
            el['coordinates']['coordinates'][1],
            el['coordinates']['coordinates'][0]
          );
          return distance < 20;
        });

        if(filtered_data.length>0){
          var popUp = leaflet.popup().setLatLng(location).setContent(filtered_data[0]["text"]).openOn(current.map)
        }
      })

    }

    get_distance(lat1, lon1, lat2, lon2) {
      var R = 6371; // Radius of the earth in km
      var dLat = this.deg2rad(lat2 - lat1); // deg2rad below
      var dLon = this.deg2rad(lon2 - lon1);
      var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.deg2rad(lat1)) *
          Math.cos(this.deg2rad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c; // Distance in km
      return d;
    }
    deg2rad(deg) {
      return deg * (Math.PI / 180);
    }


  }






