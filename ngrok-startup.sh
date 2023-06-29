#!/bin/bash

# Opening a new terminal and starting ngrok
gnome-terminal -- bash -c 'exec ngrok http 5000'
# Waiting ngrok to initialize
sleep 10

# Getting the Public URL from ngrok
public_url=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')

# Getting the current directory
script_dir=$(dirname "$0")


# Updating the .env file
sed -i 's#^REACT_APP_NGROK_URL=.*#REACT_APP_NGROK_URL="'$public_url'"#' $script_dir/react-app/.env
