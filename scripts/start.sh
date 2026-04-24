#!/bin/sh
echo "Running migrations..."
drizzle-kit migrate
echo "Starting server..."
npm run serve
