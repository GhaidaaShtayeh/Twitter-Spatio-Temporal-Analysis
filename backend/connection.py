from fastapi import FastAPI , Request
from http import HTTPStatus
from dataclasses import dataclass
import uvicorn
from fastapi_elasticsearch import ElasticsearchAPIQueryBuilder
from model.app_service import genarete_query
from model.app_service import connect_elasticsearch
from model.app_service import SerchQuery



query_builder = ElasticsearchAPIQueryBuilder()

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
  
@app.post("/search") 
async def _search(query:SerchQuery) -> dict:
    try:
        es_query = genarete_query(query)
        print(es_query)
        es = connect_elasticsearch()
        resp = es.search(index="some_index", body=es_query,size=100)
        print("Got %d Hits:" % resp['hits']['total']['value'])
        for hit in resp['hits']['hits']:
            print("%(created_at)s id : %(id)s:  text : %(text)s" % hit["_source"])
        print(len(resp))
        response = {
        "message": HTTPStatus.OK.phrase,
        "status-code": HTTPStatus.OK,
        "data": resp
        }
        return response
    except Exception as ex:
        print(str(ex))
  

if __name__ == "__main__":
    uvicorn.run("connection:app", host="0.0.0.0", port=5000, reload=True)
