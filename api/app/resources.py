# -*- coding: utf-8 -*-
import re
import json
import time
import json
import os
from flask import request
from flask_restful import Resource, reqparse
import requests
from app.auth import initOAuth2Session, OAuth2Login, logout
from authlib.common.errors import AuthlibBaseError
from app.models import db, AppMetaData, LoggedInUser, User, Stock
from app.tasks import updateStocksFromAPI, getMovingAverage
from urllib.parse import quote
from celery.result import AsyncResult

iex_api_url = 'https://api.iextrading.com/1.0'


# TODO: this could be moved elsewhere
def authenticate():
    if 'X-API-Key' not in request.headers:
        return (False, {'reason': 'missing_header', 'target': 'X-API-Key'})
    api_secret = request.headers['X-API-Key']
    db_logged_in_user = LoggedInUser.query.filter_by(api_secret=api_secret).first()
    if db_logged_in_user is None:
        return (False, {'reason': 'invalid_value', 'target': 'X-API-Key'})
    else:
        return db_logged_in_user.validateLogin(api_secret)

class ListGainers(Resource):
    def get(self):
        response = requests.get(iex_api_url + '/stock/market/list/gainers')
        return {'success': True, 'data': response.json()}


class StockInfo(Resource):
    def get(self, symbol=None):
        # Just return all stocks if no single symbol was provided
        if symbol is None:
            stocks_db_result = Stock.query.all()
        else:
            stocks_db_result = Stock.query.filter_by(symbol=symbol).first()

        # Collect the information inside a list of dicts
        return_data = []
        for stock in stocks_db_result:
            return_data.append({'symbol': stock.symbol, 'name': stock.name, 'type': stock.type, 'is_enabled': stock.is_enabled})
        return {'success': True, 'data': return_data}

    def post(self):
        updateStocksFromAPI.delay()

class StockCompany(Resource):
    def get(self, symbol):
        symbol_esc = quote(symbol, safe='')
        is_stock_known = Stock.query.filter_by(symbol=symbol_esc).first()
        if is_stock_known is None:
            return {'success': False, 'error': f'Unknown stock symbol: {symbol_esc}'}
        else:
            response = requests.get(f'{iex_api_url}/stock/{symbol}/company')
            return {'success': True, 'data': response.json()}

class StockLogo(Resource):
    def get(self, symbol):
        symbol_esc = quote(symbol, safe='')
        is_stock_known = Stock.query.filter_by(symbol=symbol_esc).first()
        if is_stock_known is None:
            return {'success': False, 'error': f'Unknown stock symbol: {symbol_esc}'}
        else:
            response = requests.get(f'{iex_api_url}/stock/{symbol}/logo')
            return {'success': True, 'data': response.json()}

class StockNews(Resource):
    def get(self, symbol):
        symbol_esc = quote(symbol, safe='')
        is_stock_known = Stock.query.filter_by(symbol=symbol_esc).first()
        if is_stock_known is None:
            return {'success': False, 'error': f'Unknown stock symbol: {symbol_esc}'}
        else:
            response = requests.get(f'{iex_api_url}/stock/{symbol}/news/last/10')
            return {'success': True, 'data': response.json()}

class StockChart(Resource):
    def get(self, symbol):
        symbol_esc = quote(symbol, safe='')
        is_stock_known = Stock.query.filter_by(symbol=symbol_esc).first()
        if is_stock_known is None:
            return {'success': False, 'error': f'Unknown stock symbol: {symbol_esc}'}
        else:
            parser = reqparse.RequestParser()
            parser.add_argument('range')
            args = parser.parse_args()
            interval = quote(args['range']) if args['range'] else '5y'
            response = requests.get(iex_api_url + f'/stock/{symbol_esc}/chart/{interval}')
            return {'success': True, 'data': response.json()}

class UserInfo(Resource):
    def get(self):
        try:
            success, obj = authenticate()
            if not success:
                return {'success': False, 'error': obj}
            return {'success': True, 'data': {'user_name': obj.name, 'user_email': obj.email, 'user_picture_url': obj.picture_url}}
        except ValueError as err:
            return {'success': False, 'error': {'reason': str(err), 'target': None}}
        except AuthlibBaseError as err:
            return {'success': False, 'error': {'reason': 'err.description', 'target': None}}


class UserStocks(Resource):
    def get(self):
        try:
            success, obj = authenticate()
            if not success:
                return {'success': False, 'error': obj}
            stocks = obj.getStocks()

             # Collect the information inside a list of dicts
            return_data = []
            for stock in stocks:
                return_data.append({'symbol': stock.symbol, 'name': stock.name, 'type': stock.type, 'is_enabled': stock.is_enabled})
            return {'success': True, 'data': return_data}
        except ValueError as err:
            return {'success': False, 'error': {'reason': str(err), 'target': None}}
        except AuthlibBaseError as err:
            return {'success': False, 'error': {'reason': 'err.description', 'target': None}}

    def post(self):
        try:
            success, obj = authenticate()
            if not success:
                return {'success': False, 'error': obj}
            parser = reqparse.RequestParser()
            parser.add_argument('stock_symbols', action='append', required=True, help="Stock symbols are required")
            args = parser.parse_args()
            stock_symbols = args['stock_symbols']
            if not isinstance(stock_symbols, list):
                return {'success': False, 'error': 'Stock symbols should be provided in a list'}
            return obj.addStocks(stock_symbols)

        except ValueError as err:
            return {'success': False, 'error': {'reason': str(err), 'target': None}}
        except AuthlibBaseError as err:
            return {'success': False, 'error': {'reason': err.description, 'target': None}}


    def delete(self, stock_symbol):
        try:
            success, obj = authenticate()
            if not success:
                return {'success': False, 'error': obj}
            return obj.deleteStock(symbol)

        except ValueError as err:
            return {'success': False, 'error': {'reason': str(err), 'target': None}}
        except AuthlibBaseError as err:
            return {'success': False, 'error': {'reason': err.description, 'target': None}}


class Authenticate(Resource):
    def get(self, auth_provider):
        try:
            return {'success': True, 'data': {'auth_url': initOAuth2Session(auth_provider)}}
        except ValueError as err:
            return {'success': False, 'error': str(err)}
        except AuthlibBaseError as err:
            return {'success': False, 'error': err.description}


class Login(Resource):
    def post(self, auth_provider):
        parser = reqparse.RequestParser()
        parser.add_argument('authorization_response', required=True, help="Authorization server response is required")
        args = parser.parse_args()
        auth_response = args['authorization_response']
        try:
            api_secret, login_expires_in = OAuth2Login(auth_provider, auth_response)
            return {'success': True, 'data': {'api_secret': api_secret, 'expires_in': login_expires_in}}
        except ValueError as err:
            return {'success': False, 'error': str(err)}
        except AuthlibBaseError as err:
            return {'success': False, 'error': err.description}


class Logout(Resource):
    def post(self):
        if not 'X-API-Key' in request.headers:
            return {'success': False, 'error': {'reason': 'missing_header', 'target': 'X-API-Key'}}
        api_secret = request.headers['X-API-Key']
        try:
            return {'success': logout(api_secret)}
        except ValueError as err:
            return {'success': False, 'error': str(err)}
        except AuthlibBaseError as err:
            return {'success': False, 'error': err.description}


class MovingAverage(Resource):
    def get(self, symbol):
        try:
            success, obj = authenticate()
            if not success:
                return {'success': False, 'error': obj}

            symbol_esc = quote(symbol, safe='')
            is_stock_known = Stock.query.filter_by(symbol=symbol_esc).first()
            if is_stock_known is None:
                return {'success': False, 'error': f'Unknown stock symbol: {symbol_esc}'}
            response = requests.get(iex_api_url + f'/stock/{symbol_esc}/chart/5y')
            parser = reqparse.RequestParser()
            parser.add_argument('interval', type=int)
            args = parser.parse_args()

            interval = 200
            if args['interval'] is not None:
                interval = args['interval']

            task = getMovingAverage.delay(response.json(), interval)
            return {'success': True, 'data': {'task_id': task.task_id}}

        except ValueError as err:
            return {'success': False, 'error': str(err)}
        except AuthlibBaseError as err:
            return {'success': False, 'error': err.description}


class TaskResult(Resource):
    def get(self, task_id):
        task_result = AsyncResult(task_id)
        response = {'success': True, 'pending': True}
        if task_result.ready():
            response['pending'] = False
            response['result'] = task_result.get()
        return response