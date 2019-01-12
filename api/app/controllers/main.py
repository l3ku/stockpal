from flask import Blueprint, render_template, flash, request, redirect, url_for

from app.models import User

main = Blueprint('main', __name__)

@main.route('/')
def home():
    return 'Hello World!'
