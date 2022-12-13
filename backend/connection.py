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
        data = es.search(index="tweet",body=es_query)
        for hit in data['hits']['hits']:
                print("%(created_at)s id : %(id)s:  text : %(text)s" % hit["_source"])
        # Stream the data out in chunks of 5 seconds
        for chunk in data:
            await asyncio.sleep(5)
            return chunk
        
    except Exception as ex:
        print(str(ex))
    
if __name__ == "__main__":
    uvicorn.run("connection:app", host="0.0.0.0", port=5000, reload=True)
