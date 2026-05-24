#!/bin/bash
cors_proxy_url=${CORS_PROXY_URL}

# place url in sketch.js
cors_proxy_url=$(echo $cors_proxy_url | sed "s/\"//g")
cors_proxy_url=$(printf '%s\n' "$cors_proxy_url" | sed -e 's/[\/&]/\\&/g')
sed -i -e "s/?replace_label_cors_proxy_url?/$cors_proxy_url/g" ./htdocs/sketch.js

# start apache
apachectl -D FOREGROUND