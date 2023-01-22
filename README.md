# Twitter Spatio-temporal Analysis
This project is aimed at conducting a spatio-temporal analysis of tweets from a Twitter stream API. The goal is to extract real-time information about events as they occur by using a combination of technologies such as Elasticsearch, Angular, Python, and FastAPI.

## Getting Started
To get started with the project, you will need to create a [Twitter developer account](https://developer.twitter.com/) and generate the necessary access keys to collect tweets from the Twitter stream API.

The tweets are collected in real-time, and the location, time, and content of the tweets are extracted and stored in Elasticsearch (ES). The tweets are then scored based on their text, location, and time, and a heatmap is plotted over a map using these scores.

A web app is built using Angular and the Leaflet SDK to display a map of a certain geographic area. The user can enter a query into an input field and have the option to include location and date fields. The tweets are retrieved from ES and scored based on text, location, and time, and a heatmap is plotted over the map using these scores.

The web app communicates with ES and serves client requests using a Python-based web framework, FastAPI.

## Prerequisites
- Node.js and npm for the Angular web app
- Python 3 for the FastAPI server
- Elasticsearch for data storage and querying

The web app will be available at http://localhost:4200/, and the server will be available at http://localhost:8000/.

## Built With
 - [Angular](https://angular.io/) - The web framework used for the front-end
 - [Leaflet](https://leafletjs.com/) - The JavaScript library used for displaying maps
 - [Python](https://www.python.org/) - The programming language used for the back-end
 - [FastAPI](https://fastapi.tiangolo.com/) - The web framework used for building the server
 - [Elasticsearch](https://www.elastic.co/) - The data storage and querying system used
