from dataclasses import dataclass
import datetime
from http import HTTPStatus
import json
import time
from fastapi import FastAPI , Request
from http import HTTPStatus
from elasticsearch import Elasticsearch,helpers

# Use the dataclass decorator to define two classes: GeoPoint and query
@dataclass
class GeoPoint:
    # Define two fields for the GeoPoint class: latitude and longitude, both of which are floating-point numbers
    latitude :float= None
    longitude :float= None
    radius :float=  None
    
@dataclass
class query:
    # Define four fields for the query class: keywords, start_date, end_date, and coordinates
    # keywords is a string, while start_date and end_date are also strings
    # coordinates is an instance of the GeoPoint class
    keywords: str = None
    start_date: str = None
    end_date: str = None
    coordinates: GeoPoint = None
    
   # Define a function called connect_elasticsearch() that initializes an Elasticsearch client and attempts to connect to it 
def connect_elasticsearch():
    # Initialize the Elasticsearch client to None
    _es = None
    # Attempt to connect to Elasticsearch on the local machine (http://localhost:9200/)
    _es = Elasticsearch("http://localhost:9200/")
    # If the connection is successful, print a message
    if _es.ping():
        print('Yay Connect')
    # If the connection fails, print a different message
    else:
        print('Awww it could not connect!')
    # Return the Elasticsearch client object
    return _es

    # Define a function called create_index() that initializes an Elasticsearch Index
def create_index(es_object, index_name): 
    # Flag to indicate whether the index was created
    created = False
    
    # Dictionary containing index settings
    settings = {
        "mappings": {
            "properties": {
                "created_at": {
                    "type": "date",
                    "fields": {
                        "keyword": {
                            "type": "keyword",
                        }
                    }
                },
                "id": {
                    "type": "keyword",
                },
                "id_str": {
                    "type": "keyword",
                },
                "text": {
                    "type": "text"
                },
                "coordinates": {
                    "type": "geo_point"
                }
            }
        }
    }
    
    try:
        if es_object.indices.exists(index=index_name):
            es_object.indices.delete(index=index_name)
        # Check if the index already exists
        if not es_object.indices.exists(index=index_name):
            # If the index doesn't exist, create it
            es_object.indices.create(index=index_name, ignore=400, body=settings, timeout=30)
            created = True
            print('Created Index')
    except Exception as ex:
        print(str(ex))
    finally:
        return created
    
#open file function in order to read a JSON file and save it into list
def read_file(file_name):
    with open(file_name,encoding="utf8") as f:
        while(True):
            time.sleep(0.01)
            line = f.readline()
            if not line:
                break
            line = json.loads(line)
            line['created_at'] = datetime.datetime.strptime(line['created_at'], '%a %b %d %H:%M:%S %z %Y').isoformat()
            #cleare the print
            yield line

def upload_data(es_object, index_name, data):
    # Upload the data to Elasticsearch
    print(next(data))
    helpers.bulk(es_object,data,index=index_name)
       
def search_with_filters(obj: query):
    # Extract the attributes from the object
    start_date = obj.start_date
    end_date = obj.end_date
    location = obj.coordinates
    keywords = obj.keywords
    # Build the Elasticsearch query
    body = {
        "query": {
            "bool": {
                "must": [],
                "filter": [],
            }
        }
    }
    
    # Add a text filter using the keywords if keywords is not None
    if keywords is not None:
        body["query"]["bool"]["must"].append({"match": {"text": keywords}})

    # Add a range filter using the start and end dates if both are not None
    if start_date is not None and end_date is not None and start_date != "" and end_date != "":
        body["query"]["bool"]["filter"].append({"range": {"created_at": {"gte": start_date, "lte": end_date}}})

    # Add a geo-point filter using the location if both latitude and longitude are not None
    if location is not None and location.latitude is not None and location.longitude is not None and  location.latitude  != "" and location.longitude != "":
        body["query"]["bool"]["filter"].append({"geo_distance": {"distance": f"{location.radius}km","coordinates": {"lat": location.latitude,"lon": location.longitude}}})

    # Return the search results
    return body
