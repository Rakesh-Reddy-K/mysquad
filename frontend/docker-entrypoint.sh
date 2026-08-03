#!/bin/sh
# Substitute only BACKEND_URL in the template; leave nginx runtime
# variables ($host, $uri, $remote_addr, etc.) untouched.
set -e

envsubst '$BACKEND_URL' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

# Hand off to the default nginx entrypoint (exec nginx -g "daemon off;")
exec /docker-entrypoint.sh nginx -g "daemon off;"