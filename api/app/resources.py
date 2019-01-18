import json
from datetime import datetime, timedelta
from flask_restful import Resource
import requests

iex_api_url = 'https://api.iextrading.com/1.0'

class ListMostActive(Resource):
    def get(self):
        response = requests.get(iex_api_url + '/stock/market/list/mostactive')
        return response.json()

class StockHistory(Resource):
    def get(self, stock_symbol):
        end = datetime.today()
        start = end - timedelta(days=365)
        return ''
