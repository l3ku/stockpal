#!/bin/bash
set -e

# Use virtual env
. ${APPDIR}/venv/bin/activate

# Wait for database
while ! mysqladmin ping -h"$MYSQL_DATABASE_HOST" --silent; do
  echo "Waiting for database... (If this gets stuck, check that MYSQL_DATABASE_HOST is set and the DB is up and running)"
  sleep 3
done
uwsgi --ini ${APPDIR}/uwsgi.ini
