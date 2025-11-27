#!/bin/sh
set -e

echo "Waiting for database connection..."

until npx prisma db push --accept-data-loss; do
  echo "Prisma db push failed. Retrying in 5 seconds..."
  sleep 5
done

echo "Database schema synced. Starting application..."
exec node dist/app.js
