FROM nginx:1.15.8

# Use our custom Nginx configuration to proxy requests to uWSGI.
RUN rm /etc/nginx/conf.d/default.conf
COPY stockpal.conf /etc/nginx/conf.d/
