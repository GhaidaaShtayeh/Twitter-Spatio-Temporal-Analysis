from dataclasses import dataclass
from http import HTTPStatus
from fastapi import FastAPI , Request
from http import HTTPStatus
from elasticsearch import Elasticsearch




#from tweet import SerchQuery
@dataclass
class GeoPoint:
    latitude:float = None
    longitude:float = None
@dataclass
class query:
    keywords: str = None
    start_date: str = None
    end_date: str = None
    coordinates: GeoPoint = None
    
def connect_elasticsearch():
    _es = None
    _es = Elasticsearch("http://localhost:9200/")
    if _es.ping():
        print('Yay Connect')
    else:
        print('Awww it could not connect!')
    return _es

def create_index(es_object, index_name): 
    created = False
    # index settings
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
        if not es_object.indices.exists(index=index_name):
            es_object.indices.create(index=index_name, ignore=400,body=settings,timeout=30)
            created = True
            print('Created Index')
    except Exception as ex:
        print(str(ex))
    finally:
        return created
    
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
                "must": [
                    # Add a range filter using the start and end dates
                    {"range": {"created_at": {"gte": start_date, "lte": end_date}}},
                    # Add a geo-point filter using the location
                    {"geo_distance": {"distance": "5000000000000000km","coordinates": {"lat": location.latitude,"lon": location.longitude}}},
                    # Add a text filter using the keywords
                    {"match": {"text": keywords}}
                ]
            }
        }
    }
    # Return the search results
    print(body)
    return body