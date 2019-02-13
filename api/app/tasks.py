from app import celery
from app.models import db, Stock
import requests

iex_api_url = 'https://api.iextrading.com/1.0'

@celery.task
def updateStocksFromAPI():
    response = requests.get(iex_api_url + '/ref-data/symbols')
    all_stocks = response.json()
    for stock in all_stocks:
        db_stock = Stock.query.filter_by(symbol=stock['symbol']).first()
        if db_stock is None:
            db_stock = Stock(symbol=stock['symbol'], name=stock['name'], type=stock['type'], is_enabled=stock['isEnabled'])
            db.session.add(db_stock)
        else:
            db_stock.name = stock['name']
            db_stock.type = stock['type']
            db_stock.is_enabled = stock['isEnabled']
    db.session.commit()
