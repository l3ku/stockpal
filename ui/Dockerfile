FROM node:6

# Initialize application with environment vars.
ENV APPNAME stockpal
ENV APPDIR /app
ENV USER $APPNAME

# Create a special user for the application, and give that user the ownership of the project files.
RUN adduser --system --disabled-password --group --gecos "${USER},,," "${USER}"
RUN mkdir -p "${APPDIR}" && \
    chown -R "${USER}:${USER}" "${APPDIR}"

USER $USER
WORKDIR $APPDIR

# Copy all files except the node_modules, those should be installed inside the Docker image according
# to the local package.json file to ensure that the dependencies are the same versions as stated in
# package-lock.json.
COPY app/ $APPDIR
RUN npm install

# Launch the application
CMD ["npm", "start"]
