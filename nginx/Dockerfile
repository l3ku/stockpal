FROM nginx:1.15.8

# Build environment variables
ARG APP_ENV
ENV APP_ENV $APP_ENV

# Create directory for custom error pages
RUN mkdir -p /opt/html/error-pages
COPY ./html/* /opt/html/error-pages

# Create proxy cache directory
RUN mkdir -p /data/nginx/cache

# Use our custom Nginx configuration to proxy requests to uWSGI.
RUN rm /etc/nginx/conf.d/default.conf
COPY ./conf.d/stockpal-${APP_ENV}.conf /etc/nginx/conf.d/
COPY ./conf.d/nginx.conf /etc/nginx/

