#!/usr/bin/env bash
# Backend startup script

cd "$(dirname "$0")"

echo "🔧 Building backend..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Backend build successful!"
  echo "🚀 Starting backend server..."
  npm start
else
  echo "❌ Build failed"
  exit 1
fi
