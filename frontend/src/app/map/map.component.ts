import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import * as leaflet from 'leaflet';
import 'heatmap.js';
import {heatData} from "../heatData";
import axios from 'axios';
import 'leaflet.heat';

declare const HeatmapOverlay: any;
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent {
  private map: any;
  public data: any[] = [];

  ngOnInit(): void {
    this.initMap();
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
      maxZoom: 18,
      minZoom: 3,
      attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    // Adding tiles to the map
    tiles.addTo(this.map);
    //Adding heat layer to a map
    const new_data = [
      [-37.8839, 175.3745188667],
      [-37.8869090667, 175.3657417333],
      [-37.8894207167, 175.4015351167]
      ]
    var new_data2 =new_data.map(function (p) { return L.latLng(p[0], p[1]); });


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





