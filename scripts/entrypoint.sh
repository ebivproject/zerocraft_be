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

  # 먼저 마이그레이션 시도 (프로덕션 환경)
  if npx prisma migrate deploy 2>/dev/null; then
    echo "✅ Database migrations applied successfully"
    break
  else
    echo "⚠️  Migration deploy failed, trying db push..."

    # 마이그레이션 실패 시 db push 사용 (개발/초기 배포)
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
  fi
done

echo "🚀 Database ready. Starting application..."
exec node dist/app.js
