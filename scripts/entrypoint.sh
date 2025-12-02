#!/bin/sh
set -e

echo "Waiting for database connection..."

# Prisma Client 생성
echo "Generating Prisma Client..."
npx prisma generate

# 데이터베이스 스키마 동기화 (재시도 로직 포함)
MAX_RETRIES=5
RETRY_COUNT=0

until [ $RETRY_COUNT -ge $MAX_RETRIES ]; do
  echo "Attempting to sync database schema (attempt $((RETRY_COUNT + 1))/$MAX_RETRIES)..."

  # db push를 먼저 실행하여 스키마 변경사항 적용
  if npx prisma db push --accept-data-loss --skip-generate; then
    echo "✅ Database schema synced with db push"
    break
  else
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      echo "❌ Schema sync failed. Retrying in 5 seconds..."
      sleep 5
    else
      echo "❌ Failed to sync database schema after $MAX_RETRIES attempts"
      exit 1
    fi
  fi
done

echo "🚀 Database ready. Starting application..."
exec node dist/app.js
