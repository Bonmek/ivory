#!/bin/sh

echo "🔁 Starting environment variable replacement..."

# Loop through a list of env vars you care about
for VAR in \
  REACT_APP_TEXT \
  REACT_APP_SUI_NETWORK \
  REACT_APP_BLOB_TYPE \
  REACT_APP_SUINS_TYPE \
  REACT_APP_OWNER_ADDRESS \
  REACT_APP_SERVER_URL \
  REACT_APP_API_USER \
  REACT_APP_API_REPOSITORIES \
  REACT_APP_API_GITHUB_AUTH \
  REACT_APP_API_CREATE_WEBSITE \
  REACT_APP_API_PREVIEW_WEBSITE \
  REACT_APP_API_DELETE_WEBSITE \
  REACT_APP_API_SET_ATTRIBUTES \
  REACT_APP_API_ADD_SITE_ID \
  VITE_GOOGLE_CLIENT_ID \
  VITE_REDIRECT_URI \
  VITE_BACKEND_API_URL \
  REACT_APP_API_UPDATE_SITE \
    
do
  VALUE=$(printenv $VAR)
  if [ ! -z "$VALUE" ]; then
    echo "🔁 Replacing $VAR with $VALUE"
    find /app/dist -type f -exec sed -i "s|__${VAR}__|$VALUE|g" {} \;
  fi
done

echo "✅ Environment variable replacement complete."
