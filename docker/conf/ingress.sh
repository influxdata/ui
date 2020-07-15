#! /bin/sh

set -e

envsubst '$PORT_HTTPS $CHRONOGRAF_BASE_PATH' < /nginx.conf > /etc/nginx/nginx.conf

nginx -g "daemon off;" -c /etc/nginx/nginx.conf
