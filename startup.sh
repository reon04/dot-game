#!/bin/bash
cors_anywhere_url=${CORS_ANYWHERE_URL}

# place url in sketch.js
cors_anywhere_url=$(echo $cors_anywhere_url | sed "s/\"//g")
cors_anywhere_url=$(printf '%s\n' "$cors_anywhere_url" | sed -e 's/[\/&]/\\&/g')
sed -i -e "s/?replace_label_cors_anywhere_url?/$cors_anywhere_url/g" ./htdocs/sketch.js

# start apache
apachectl -D FOREGROUND