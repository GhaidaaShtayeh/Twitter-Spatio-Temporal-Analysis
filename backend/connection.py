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
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="IR API",
    description="..",
    version="0.1",
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def _heath_check() -> dict:
    response = {
    "message": HTTPStatus.OK.phrase,
    "status-code": HTTPStatus.OK,
    }
    return response
  
@app.post('/stream_data')
async def stream_data(query:query):
    try:    
        # Initialize Elasticsearch client
        es = connect_elasticsearch()
        #genarate a query that are applied a filters in the data
        es_query = search_with_filters(query)
        # Query Elasticsearch for data
        res = es.search(index="tweet",body=es_query)
        # Stream the data out in chunks of 5 seconds
        res = res["hits"]["hits"]
        print(res)
        keywords = ["id","text","created_at","coordinates"]
        res = [{key:tweet["_source"][key] for key in keywords} for tweet in res]
        return {
        "message": HTTPStatus.OK.phrase,
        "status-code": HTTPStatus.OK,
        "data": res
        }

        
    except Exception as ex:
        print(str(ex))
    
if __name__ == "__main__":
    uvicorn.run("connection:app", host="0.0.0.0", port=5000, reload=True)
