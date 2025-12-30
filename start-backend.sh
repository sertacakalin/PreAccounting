#!/bin/bash

# Pre-Accounting Backend Startup Script
# Handles port conflicts and ensures clean startup

PORT=8081

echo "🔍 Checking if port $PORT is in use..."
PID=$(lsof -ti:$PORT)

if [ ! -z "$PID" ]; then
  echo "⚠️  Port $PORT is in use by process $PID"
  echo "🔪 Killing process $PID..."
  kill -9 $PID
  sleep 2
  echo "✅ Port $PORT is now free"
else
  echo "✅ Port $PORT is available"
fi

echo ""
echo "🚀 Starting Spring Boot backend on port $PORT..."
echo "📝 Logs will be shown below. Press Ctrl+C to stop."
echo ""

./mvnw spring-boot:run
