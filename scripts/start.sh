#!/bin/sh
echo "Running migrations..."
npx drizzle-kit migrate || { echo "Migration failed!"; exit 1; }
echo "Starting server..."
npm run serve
