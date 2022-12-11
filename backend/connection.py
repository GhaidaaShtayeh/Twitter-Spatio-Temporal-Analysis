import asyncio
from fastapi import FastAPI , Request
from http import HTTPStatus
from dataclasses import dataclass
from fastapi import FastAPI, Response
import uvicorn
from model.app_service import search_with_filters
from model.app_service import connect_elasticsearch
from model.app_service import query
from elasticsearch_dsl import Search


app = FastAPI(
    title="IR API",
    description="..",
    version="0.1",
    )

@app.get("/health")
def _heath_check() -> dict:
    response = {
    "message": HTTPStatus.OK.phrase,
    "status-code": HTTPStatus.OK,
    }
    return response
  
@app.post("/search") 
async def _query(query:query):
    try:
        es = connect_elasticsearch()
        es_query = search_with_filters(query)
        resp = es.search(index="tweets", body=es_query,size=100)
        print("Got %d Hits:" % resp['hits']['total']['value'])
        for hit in resp['hits']['hits']:
            print("%(created_at)s id : %(id)s:  text : %(text)s" % hit["_source"])
        response = {
        "message": HTTPStatus.OK.phrase,
        "status-code": HTTPStatus.OK,
        "data": resp
        }
    except Exception as ex:
        print(str(ex))
        response = {
        "message": HTTPStatus.BAD_REQUEST.phrase,
        "status-code": HTTPStatus.BAD_REQUEST,
        "data": "none"
    }
    finally:
        return response
    
@app.post('/stream_data')
async def stream_data(query:query):
    es = connect_elasticsearch()
    
    es_query = search_with_filters(query)
    # Query Elasticsearch for data
    data = es.search(index="tweets",body=es_query)
    for hit in data['hits']['hits']:
            print("%(created_at)s id : %(id)s:  text : %(text)s" % hit["_source"])
    # Stream the data out in chunks of 5 seconds
    for chunk in data:
        await asyncio.sleep(5)
        return chunk

if __name__ == "__main__":
    uvicorn.run("connection:app", host="0.0.0.0", port=5000, reload=True)
