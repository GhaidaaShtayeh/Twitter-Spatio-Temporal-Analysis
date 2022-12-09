from dataclasses import dataclass
from datetime import datetime
from pydantic import BaseModel


@dataclass
class GeoPoint:
    """GeoPoint features dataclass"""
    latitude:float
    longitude:float

@dataclass
class Tweet(BaseModel):
    """Tweet features dataclass"""
    created_date: datetime
    id:str
    id_str:str
    text:str
    coordinates:GeoPoint
    def __post_init__(self):
        self.coordinates = GeoPoint(**self.coordinates)
             

@dataclass
#make the attributes optional
class SerchQuery:
    text: str = None
    start_date: str = None
    end_date: str = None
    geo_spatial: GeoPoint = None