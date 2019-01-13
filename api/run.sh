#!/bin/bash
set -e

. ${APPDIR}/venv/bin/activate

uwsgi --ini ${APPDIR}/uwsgi.ini
