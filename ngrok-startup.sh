#!/bin/bash

# Declare a variable to hold the public URL
public_url=""

# Specify log file
log_file="/home/yake/ngrok-startup.log"

# Function to print debug information
debug_info() {
  echo "Public URL: $public_url" >> "$log_file"
  echo "Ngrok processes:" >> "$log_file"
  ps aux | grep ngrok >> "$log_file"
  echo "Curl Output: $curl_output" >> "$log_file"
  echo "Debugging jq:" >> "$log_file"
}

# Check if ngrok is already running
if ! ps aux | grep "[n]grok http" > /dev/null; then
  # Start ngrok in a new gnome-terminal if not running
  gnome-terminal -- bash -c "ngrok http 5000; exec bash" &
  # Wait for ngrok to initialize
  sleep 5
fi

# Loop to keep fetching the public URL
while [ -z "$public_url" ]; do
  # Capture the output of the curl command into a variable
  curl_output=$(curl --silent http://localhost:4040/api/tunnels)
  
  # Extract the public URL using jq and store it into the variable
  public_url=$(echo "$curl_output" | jq -r '.tunnels[0].public_url')

  # Print debug information
  debug_info

  # Sleep for a few seconds before trying again if public URL is not fetched
  if [ -z "$public_url" ]; then
    sleep 5
  fi
done

# Log the public URL
echo "Public URL: $public_url" >> "$log_file"

# Update the .env file
echo "REACT_APP_PUBLIC_URL=$public_url" > /home/yake/code/PBM-web-sandbox/.env
