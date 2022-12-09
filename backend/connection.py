from fastapi import FastAPI , Request
from http import HTTPStatus
from dataclasses import dataclass
import uvicorn
from fastapi_elasticsearch import ElasticsearchAPIQueryBuilder
from model.app_service import genarete_query
from model.app_service import connect_elasticsearch
from model.app_service import query
from elasticsearch_dsl import Search


query_builder = ElasticsearchAPIQueryBuilder()

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
        es_query = genarete_query(query)
        es = connect_elasticsearch()
        resp = es.search(index="tweet", body=es_query,size=100)
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
    finally:
        return response

  

if __name__ == "__main__":
    print("hello ")
    s = Search(using=connect_elasticsearch(), index="tweet") \
    .filter("match", text="Ringing") 
    response = s.execute()
    print("Got %d Hits:" % response['hits']['total']['value'])
    uvicorn.run("connection:app", host="0.0.0.0", port=5000, reload=True)
