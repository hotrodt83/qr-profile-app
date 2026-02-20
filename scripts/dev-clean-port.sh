#!/usr/bin/env bash
# ===============================
# FIX: Port 3001 already in use
# ===============================

echo "🔍 Who is using port 3001?"
lsof -nP -iTCP:3001 -sTCP:LISTEN

echo "💀 Killing whatever is on 3001..."
lsof -tiTCP:3001 -sTCP:LISTEN | xargs kill -9 2>/dev/null || true

echo "✅ Port 3001 should be free now. Starting dev server..."
npm run dev
