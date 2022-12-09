from http import HTTPStatus
from fastapi import FastAPI , Request
from http import HTTPStatus
from model.tweet import SerchQuery

def genarete_query(query:SerchQuery) -> dict:
    base_query = {"query": {"bool": {"must": [], "filter": []}}}
    if query.start_date and query.end_date:
        base_query["query"]["bool"]["filter"].append(
            {
                "range": {
                    "created_at": {
                        "gte": query.start_date,
                        "lte": query.end_date,
                    }
                }
            }
        )
    if query.text:
        base_query["query"]["bool"]["must"].append({"match": {"text": query.text}})
    if query.geo_spatial:
        base_query["query"]["bool"]["filter"].append(
            {
                "geo_distance": {
                    "distance": f"{query.geo_spatial.radius}km",
                    "coordinates": {
                        "lat": query.geo_spatial.latitude,
                        "lon": query.geo_spatial.longitude,
                        
                    },
                }
            }
        )
    return base_query
