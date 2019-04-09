from flask_restful import Api
from flask import Blueprint
from app.resources import *

main = Blueprint('main', __name__)

# Initialize API and its resources
api = Api(main)

# Use different base urls for different API versions
api_base_url = '/api'
v1_base_url = api_base_url + '/v1'

# Endpoints for API v1.0
api.add_resource(ListGainers, v1_base_url + '/gainers')
api.add_resource(StockChart, v1_base_url + '/stock/<string:symbol>/chart')
api.add_resource(StockInfo, v1_base_url + '/stock/<string:symbol>', v1_base_url, v1_base_url + '/stock/<string:symbol>', v1_base_url + '/', v1_base_url + '/stock')
api.add_resource(StockLogo, v1_base_url + '/stock/<string:symbol>/logo')
api.add_resource(StockNews, v1_base_url + '/stock/<string:symbol>/news')
api.add_resource(StockCompany, v1_base_url + '/stock/<string:symbol>/company')


# Authentication
# @TODO: GET /api/oauth should return all providers
api.add_resource(Authenticate, api_base_url + '/oauth/authenticate/<string:auth_provider>')
api.add_resource(Login, api_base_url + '/oauth/login/<string:auth_provider>')
api.add_resource(Logout, api_base_url + '/oauth/logout')

# Authenticated endpoints
api.add_resource(UserInfo, api_base_url + '/protected/userinfo')
api.add_resource(UserStocks, api_base_url + '/protected/stocks')
api.add_resource(MovingAverage, api_base_url + '/protected/ml/movingaverage/<string:symbol>')
