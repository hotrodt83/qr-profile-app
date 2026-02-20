#!/usr/bin/env bash
set -e

echo "🔥 Killing stuck dev servers..."
pkill -f node 2>/dev/null || true
pkill -f next 2>/dev/null || true
pkill -f vite 2>/dev/null || true

echo "🧹 Clearing caches..."
rm -rf .next dist build node_modules/.cache .turbo .vercel

echo "📦 Reinstalling deps..."
rm -rf node_modules
npm install

echo "🚀 Starting dev server..."
npm run dev
