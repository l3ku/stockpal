#!/bin/bash
set -e

# Wait for database
while ! mysqladmin ping -h"$MYSQL_DATABASE_HOST" --silent; do
  echo "Waiting for database... (If this gets stuck, check that MYSQL_DATABASE_HOST is set and the DB is up and running)"
  sleep 3
done

# Handle different tasks depending on wether this is for Celery or Flask.
APP_TYPE=${DEPLOY_ENV:-'flask'}
if [[ $APP_TYPE == "celery" ]]; then
  celery worker -B -l info -A app.runcelery:celery
else
  # Run database upgrades
  flask db upgrade -d ${APPDIR}/app/migrations
  flask db migrate -d ${APPDIR}/app/migrations
  flask db upgrade -d ${APPDIR}/app/migrations

  # Start uwsgi
  uwsgi --ini ${APPDIR}/uwsgi.ini
fi
