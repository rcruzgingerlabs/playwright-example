#!/bin/bash

# Variables - Set your API key, test name, and app name here
API_KEY="y5mFVUYc04G6Ib6L0MgdpchRZkyKy5KeEkqO3Ba4bjM110"
APP_NAME="Notes"
TEST_NAME="Note drawing"
BATCH_NAME="Note login and drawing"
IMAGE_PATH=$1  # Pass the image file path as an argument
STEP_NAME="Note renderer"

# Check if an image path was provided
if [ -z "$IMAGE_PATH" ]; then
  echo "Usage: $0 <path-to-image>"
  exit 1
fi

# Check if the file exists
if [ ! -f "$IMAGE_PATH" ]; then
  echo "Error: File $IMAGE_PATH not found!"
  exit 1
fi

# Convert the image to Base64
BASE64_IMAGE=$(base64 -b 0 -i "$IMAGE_PATH")

curl -i -X GET \
-H "X-Eyes-Api-Key: $API_KEY" \
https://eyes.applitools.com/api/v1/auth/api-key-validation

# cURL command to upload the image to Applitools
# curl -i -X POST \
# -H "Content-Type: application/json" \
# -H "X-Eyes-Api-Key: $API_KEY" \
# -d '{
#   "appIdOrName": "'"$APP_NAME"'",
#   "testName": "'"$TEST_NAME"'",
#   "batch": {
#     "name": "'"$BATCH_NAME"'"
#   },
#   "stepsInfo": [
#     {
#       "name": "'"$STEP_NAME"'",
#       "image": "'"$BASE64_IMAGE"'"
#     }
#   ]
# }' \
# https://eyes.applitools.com/api/v1/images

# echo "Image uploaded successfully to Applitools Eyes!"
