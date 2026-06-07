#!/usr/bin/env bash
set -e

echo "╔══════════════════════════════════════╗"
echo "║        QuoteCraft — Launch           ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── Check Node.js ──
if ! command -v node &>/dev/null; then
  echo "❌ Node.js is required. Install from https://nodejs.org"
  exit 1
fi
echo "✅ Node.js $(node -v)"

# ── Environment ──
if [ ! -f .env.local ]; then
  if [ -f .env.example ]; then
    echo "⚠️  No .env.local found. Creating from .env.example..."
    cp .env.example .env.local
    echo "   Edit .env.local with your keys before the app will work fully."
  else
    echo "⚠️  No .env.local or .env.example found."
  fi
fi

# ── Dependencies ──
if [ ! -d node_modules ]; then
  echo "📦 Installing dependencies..."
  npm install
else
  echo "✅ Dependencies installed"
fi

# ── Run database seed (optional) ──
SEED_SCRIPT="scripts/seed.ts"
if [ -f "$SEED_SCRIPT" ] && [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "🌱 Database seed script available — run with: npx tsx $SEED_SCRIPT"
fi

# ── Start dev server ──
echo ""
echo "🚀 Starting QuoteCraft dev server..."
echo "   → http://localhost:3000"
echo ""
npm run dev
