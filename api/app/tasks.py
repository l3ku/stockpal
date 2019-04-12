from celery.signals import worker_ready
from app import celery
from app.models import db, Stock
import requests
import pandas as pd

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

@worker_ready.connect
def updateStocksInit(sender, **k):
    with sender.app.connection() as conn:
        sender.app.send_task('app.tasks.updateStocksFromAPI', connection=conn)

@celery.task
def getMovingAverage(data, range):
    df = pd.DataFrame(data)
    ma = df['close'].rolling(window=range, center=False).mean()

    result = []
    for index, row in enumerate(data):

        # Include NaN values as None
        if ma[index] == ma[index]:
            result.append({'date': row['date'], 'ma': ma[index]})
        else:
            result.append({'date': row['date'], 'ma': None})
    return result

