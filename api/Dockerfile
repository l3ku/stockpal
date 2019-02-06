FROM phusion/baseimage:0.11

RUN apt-get update && \
  apt-get --assume-yes install \
    gcc \
    python3 \
    python3-pip \
    python3-dev \
    uwsgi \
    uwsgi-plugin-python3 \
    default-libmysqlclient-dev \
    mysql-client

ENV APPNAME stockpal
ENV USER $APPNAME
ENV APPDIR /app


RUN adduser --system --disabled-password --group --gecos "${USER},,," "${USER}"
RUN mkdir -p "${APPDIR}" && \
  chown -R "${USER}:${USER}" "${APPDIR}"

# Move entrypoint to fs root and drop priviledges
COPY run.sh /run.sh

WORKDIR $APPDIR
USER $USER

COPY requirements.txt Makefile uwsgi.ini "${APPDIR}/"
RUN pip3 install -r requirements.txt

COPY app/ "${APPDIR}/app/"

ENV LC_ALL C.UTF-8
ENV LANG C.UTF-8
ENV FLASK_APP app.create

# Add pip3 packages to PATH
ENV PATH /home/${USER}/.local/bin:${PATH}

ENTRYPOINT ["/run.sh"]
