#!/bin/sh
echo "Running database migrations..."
bunx drizzle-kit migrate

echo "Running database seeders..."
bun run src/utils/db/seed.ts || echo "Seed skipped or already seeded"

echo "Starting application..."
exec bun run index.ts
