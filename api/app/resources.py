import json
from datetime import datetime, timedelta
from flask_restful import Resource
import iexfinance as iex

class Last(Resource):
    def get(self):
        return iex.get_market_last()

class StockHistory(Resource):
    def get(self, stock_symbol):
        end = datetime.today()
        start = end - timedelta(days=365)
        return iex.stocks.get_historical_data(stock_symbol, start, end)
