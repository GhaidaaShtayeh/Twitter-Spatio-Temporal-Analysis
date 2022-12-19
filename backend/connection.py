from http.client import HTTPException
from elasticsearch import helpers
from fastapi import FastAPI, Request
from http import HTTPStatus
import uvicorn
from model.app_service import read_file
from model.app_service import create_index
from model.app_service import search_with_filters
from model.app_service import connect_elasticsearch
from model.app_service import query
from fastapi.middleware.cors import CORSMiddleware

# Create an instance of the FastAPI class
app = FastAPI(
    # Set the title of the API to "IR API"
    title="IR API",
    # Set the description of the API
    description="..",
    # Set the version of the API
    version="0.1",
)

# Add the CORSMiddleware instance to the FastAPI instance
app.add_middleware(
    CORSMiddleware,
    # Set the allowed origins to "*" (all origins)
    allow_origins=["*"],
    # Set allow_credentials to True to enable credentials in the request
    allow_credentials=True,
    # Set the allowed HTTP methods to "*" (all methods)
    allow_methods=["*"],
    # Set the allowed HTTP headers to "*" (all headers)
    allow_headers=["*"],
)


# Define the /health endpoint
@app.get("/health")
def _heath_check() -> dict:
    # Create a response dictionary
    response = {
        # Set the message to the OK phrase from the HTTPStatus class
        "message": HTTPStatus.OK.phrase,
        # Set the status code to the OK value from the HTTPStatus class
        "status-code": HTTPStatus.OK,
    }
    # Return the response dictionary
    return response
  
@app.post('/stream_data')
async def stream_data(query:query):
    # try to execute the following code
        # Initialize Elasticsearch client
        es = connect_elasticsearch()
        #genarate a query that are applied a filters in the data
        es_query = search_with_filters(query)
        # Query Elasticsearch for data
        try:    
            res = es.search(index="tweet",body=es_query , size = 10000)
            print(res)
            # Extract data from the response
            res = res["hits"]["hits"]
            # Define a list of keywords to be extracted from the search results
            # Extract the keywords for each search result
            res = [{"id":tweet["_id"],"score":tweet["_score"],"text":tweet["_source"]["text"],"coordinates":tweet["_source"]["coordinates"],"created_at":tweet["_source"]["created_at"]} for tweet in res]
            print(len(res))
            # Return the search results
            return {
            "message": HTTPStatus.OK.phrase,
            "status-code": HTTPStatus.OK,
            "data": res
            }
         # If any errors occur, return an error message
        except Exception as ex:
            print(str(ex))    


    
     
if __name__ == "__main__":
    # Run the uvicorn server, using the "connection" module and the "app" object within it
    # Listen on all network interfaces (0.0.0.0) on port 5000
    # Enable automatic reloading on file changes
    es_object = connect_elasticsearch()
    create_index(es_object, "tweets_test5")
    helpers.bulk(es_object,read_file("D:\\tweets\\boulder_flood_geolocated_tweets.json"),index = "tweets_test5")
    print ("data added successfully into index name : " , "tweets_test5")    
    uvicorn.run("connection:app", host="0.0.0.0", port=5000, reload=True)
