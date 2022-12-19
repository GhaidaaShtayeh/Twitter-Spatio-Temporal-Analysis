import { Query } from './../model/query';
import { Component,  OnInit } from '@angular/core';
import * as leaflet from 'leaflet';
import 'heatmap.js';
import 'leaflet.heat';
import { GeoPoint } from '../model/geo-point';
import { StreamDataService } from '../service/stream-data-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
var SelectArea = require('leaflet-area-select');
import * as $ from 'jquery';
import 'jquery-ui/ui/widgets/datepicker';
import 'leaflet-draw';
import { ViewChild, ElementRef } from '@angular/core';
import { Map } from 'leaflet';
import "leaflet-easybutton"

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

// Create a new class for the map component that implements the OnInit interface
export class MapComponent implements OnInit {

  @ViewChild('modalContainer') modalContainer: ElementRef;
  showModal = false; // Initialize showModal to false
  hideModal = true ;

  // Declare a variable for the map and initialize it as null
  private map: any = null;

  heatLayer : any =null;
  // Declare a variable for the tweets data
  tweets = [];

  // Declare a variable for the query object
  query: Query = new Query;

  // Declare a variable for the heatmap data
  public data: any[] = [];



  // Declare a variable for the form group using the FormBuilder
  queryForm: FormGroup = this._formbuilder.group({
  keywords: [''],
  start_date: [''],
  end_date: [''],
  lat: [''],
  lon: [''],
  });

  // Inject the FormBuilder and StreamDataService in the constructor
  constructor(private _formbuilder: FormBuilder, private streamDataService: StreamDataService) {}

  // Implement the ngOnInit method to initialize the map when the component is loaded
  ngOnInit(): void {
  this.initMap();
  this.mapClicked();
  this.searchButton();

  }

  // Create a method to handle the form submission
  public onSave(){
   this.query.keywords = $("#keyword").val()
   this.query.start_date = $("#startdatepicker").val()
   this.query.end_date = $("#enddatepicker").val()
   console.log(this.query)
   if(this.query.keywords == ''){
    this.query.keywords = null
   }
   if(this.query.start_date == ''){
    this.query.start_date = null
   }
   if(this.query.end_date == ''){
    this.query.end_date = null
   }
     this.streamDataService.streamData(this.query)
      .subscribe(data => {
        this.tweets = data["data"];
        this.initHeatMap()
        $("#form-container").css("display","none")
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
    var drawnItems = leaflet.featureGroup();
    this.map.addLayer(drawnItems);
    var drawControl = new leaflet.Control.Draw({
      draw: {
          circle: {
            shapeOptions: {
              color: '#f357a1',
              fillColor: '#f357a1',
              fillOpacity: 0.2,

            },
          },
          marker: false,
          polyline: false,
          circlemarker: false,
          rectangle: false,
          polygon: false

      },
      edit : {
        featureGroup : drawnItems,
        remove : true,
        edit : false
      }

  })
  this.map.addControl(drawControl)

  var current = this
  this.map.on('draw:created', function (e) {
    var type = e.layerType,
        layer = e.layer;

    if (type === 'circle') {
        var radius = layer.getRadius();
        var coordinates = layer.toGeoJSON().geometry.coordinates;
        current.query.coordinates = new GeoPoint
        current.query.coordinates!.latitude = coordinates[1];
        current.query.coordinates!.longitude = coordinates[0];
        current.query.coordinates.radius = radius/1000;
    }

    current.map.addLayer(layer);
    current.streamDataService.streamData(current.query).subscribe(data => {
      current.tweets = data["data"];
      current.initHeatMap()
    })
        });

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

      const totalScore = this.tweets.reduce((prev, curr) => prev + curr.score, 0);

      // Extract coordinates from data
     var new_data2 =this.tweets.map(function (p:any)  {
      return leaflet.latLng(p["coordinates"]["coordinates"][1], p["coordinates"]["coordinates"][0],p["score"]/totalScore);
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


    updateModalPosition() {
      const mapBounds = this.map.getBounds();
      const topLeft = this.map.latLngToContainerPoint(mapBounds.getNorthWest());
      this.modalContainer.nativeElement.style.top = `${topLeft.y}px`;
      this.modalContainer.nativeElement.style.left = `${topLeft.x}px`;
    }

    searchButton(){
      leaflet.easyButton("fa fa-search",function(button,map){
        if($("#form-container").is(":visible")){
          $("#form-container").hide()
        }else{
            $("#form-container").show()
        }
      }).addTo(this.map)
    }
  }










