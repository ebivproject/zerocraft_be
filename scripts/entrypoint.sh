#!/bin/sh
set -e

until npx prisma migrate deploy; do
  echo "Prisma migrate deploy failed. Retrying in 5 seconds..."
  sleep 5
done

echo "Prisma migrate deploy succeeded. Starting application..."
exec node dist/app.js
