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
api.add_resource(ListMostActive, v1_base_url + '/mostactive')
api.add_resource(StockHistory, v1_base_url + '/history/<string:stock_symbol>')
