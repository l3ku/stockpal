from flask_restful import Api
from flask import Blueprint

from app.resources import *

main = Blueprint('main', __name__)

# Initialize API and its resources
api = Api(main)
api.add_resource(Last, '/')
api.add_resource(StockHistory, '/history/<string:stock_symbol>')
