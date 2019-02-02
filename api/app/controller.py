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

# Authentication
# @TODO: GET /api/oauth should return all providers
api.add_resource(Authenticate, api_base_url + '/oauth/authenticate/<string:auth_provider>')
api.add_resource(Login, api_base_url + '/oauth/login/<string:auth_provider>')
api.add_resource(Logout, api_base_url + '/oauth/logout')
