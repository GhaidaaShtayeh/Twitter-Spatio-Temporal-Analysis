from fastapi import FastAPI , Request
from http import HTTPStatus
from dataclasses import dataclass
from elasticsearch import Elasticsearch
from datetime import datetime
import uvicorn
from pydantic import BaseModel
from fastapi_elasticsearch import ElasticsearchAPIQueryBuilder
from model.tweet import SerchQuery
from service.app_service import genarete_query

query_builder = ElasticsearchAPIQueryBuilder()
from model.tweet import Tweet

    
app = FastAPI(
    title="IR API",
    description="..",
    version="0.1",
    )

@app.get("/health")
def _heath_check() -> dict:
    """Health check."""
    response = {
    "message": HTTPStatus.OK.phrase,
    "status-code": HTTPStatus.OK,
    }
    return response

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
  
@app.post("/search") 
async def _search(es , query:SerchQuery) -> dict:
    print(query)
    es_query = genarete_query(query)
    print(es_query)
    res = es.search(index="tweets", body=es_query,size=100)
    #filter the res
    res = res["hits"]["hits"]
    keywords = ["id","text","created_at","coordinates"]
    res = [{key:tweet["_source"][key] for key in keywords} for tweet in res]
    print(len(res))
    print(es_query)
    print(query)
    response = {
    "message": HTTPStatus.OK.phrase,
    "status-code": HTTPStatus.OK,
    "data": res
    }
    return response
  
if __name__ == "__main__":
    create_index(connect_elasticsearch(),"testing")
    uvicorn.run("connection:app", host="0.0.0.0", port=5000, reload=True)
