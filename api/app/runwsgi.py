# -*- coding: utf-8 -*-
from app.factories.flask import create_app

application = create_app()

if __name__ == '__main__':
  application.run()
