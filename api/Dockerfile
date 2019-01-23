FROM phusion/baseimage:0.11

RUN apt-get update && \
  apt-get --assume-yes install \
    python3 \
    python3-virtualenv \
    uwsgi \
    uwsgi-plugin-python3 \
    virtualenv \
    default-libmysqlclient-dev \
    mysql-client

ENV APPNAME stockpal
ENV USER $APPNAME
ENV APPDIR /app

RUN adduser --system --disabled-password --group --gecos "${USER},,," "${USER}"
RUN mkdir -p "${APPDIR}" && \
  chown -R "${USER}:${USER}" "${APPDIR}"

WORKDIR $APPDIR
USER $USER

RUN virtualenv --no-site-packages --python /usr/bin/python3 "${APPDIR}/venv"

COPY requirements.txt Makefile uwsgi.ini "${APPDIR}/"
RUN . "${APPDIR}/venv/bin/activate" && \
    pip install -r requirements.txt

# Move entrypoint to fs root
USER root
COPY run.sh /run.sh
USER $USER

COPY app/ "${APPDIR}/app/"
RUN . "${APPDIR}/venv/bin/activate"

ENTRYPOINT ["/run.sh"]
