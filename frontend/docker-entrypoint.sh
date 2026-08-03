#!/bin/sh
set -e

# Only substitute $BACKEND_URL in the template.
# This preserves all nginx runtime variables ($host, $remote_addr, etc.)
# which would otherwise be wiped to empty strings by a blanket envsubst.
envsubst '$BACKEND_URL' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g "daemon off;"