FROM nginx:1.15.8

# Create directory for custom error pages
RUN mkdir -p /opt/html/error-pages
COPY ./html/* /opt/html/error-pages

# Use our custom Nginx configuration to proxy requests to uWSGI.
RUN rm /etc/nginx/conf.d/default.conf
COPY ./conf.d/stockpal.conf /etc/nginx/conf.d/
COPY ./conf.d/nginx.conf /etc/nginx/
