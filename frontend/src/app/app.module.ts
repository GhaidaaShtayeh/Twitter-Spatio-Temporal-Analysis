import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { StreamDataComponent } from './stream-data/stream-data.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    StreamDataComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
