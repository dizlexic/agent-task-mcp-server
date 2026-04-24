#!/bin/sh
echo "Running migrations..."
./node_modules/.bin/drizzle-kit migrate || { echo "Migration failed!"; exit 1; }
echo "Starting server..."
npm run serve
