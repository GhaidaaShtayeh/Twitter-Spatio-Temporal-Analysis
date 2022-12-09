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
    radius: float =None

@dataclass
class query:
    text: str = None
    start_date: str = None
    end_date: str = None
    coordinates: GeoPoint = None
    
def genarete_query(new_query:query) -> dict:
    base_query = {"query": {"bool": {"filter": [] ,"must": [] }}}
    if new_query.start_date and new_query.end_date:
        base_query["query"]["bool"]["filter"].append(
            {
                "range": {
                    "created_at": {
                        "gte": new_query.start_date,
                        "lte": new_query.end_date,
                    }
                }
            }
        )
        if new_query.coordinates:
            base_query["query"]["bool"]["filter"].append(
            {
                "geo_distance": {
                    "distance": f"{new_query.coordinates.radius}km",
                    "coordinates": {
                        "lat": new_query.coordinates.latitude,
                        "lon": new_query.coordinates.longitude,
                        
                    }
                }
            }
        )
    if new_query.text:
        base_query["query"]["bool"]["must"].append({"match": {"text": new_query.text}})
    return base_query


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