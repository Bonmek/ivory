#!/bin/sh

echo "🔁 Starting environment variable replacement..."

# Loop through a list of env vars you care about
for VAR in \
  SUI_Hex \
  GITHUB_CLIENT_ID \
  GITHUB_CLIENT_SECRET \
  CALLBACK_URL \
  FRONTEND_URL \
  FRONTEND_URL_FOR_TEST \
  BACKEND_PORT \
  SUI_RPC_URL \
  CONTRIBUTIONDAO_URL \
  STORAGE_TIMEOUT \
  GOOGLE_APPLICATION_CREDENTIALS \
  CLOUD_NAME \
  PROJECT_ID \
  REGION \
  JOB_ID \
  SERVICE_ACCOUNT_EMAIL \
    
do
  VALUE=$(printenv $VAR)
  if [ ! -z "$VALUE" ]; then
    echo "🔁 Replacing $VAR with $VALUE"
    find /app/dist -type f -exec sed -i "s|__${VAR}__|$VALUE|g" {} \;
  fi
done

echo "✅ Environment variable replacement complete."
