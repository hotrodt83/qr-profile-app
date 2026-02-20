# ===== FULL SYSTEM VERIFY + FIX BLOCK =====

echo "🚀 Starting full verification..."

# 1️⃣ Hard clean
echo "🧹 Cleaning project..."
rm -rf .next node_modules package-lock.json

# 2️⃣ Fresh install
echo "📦 Installing dependencies..."
npm install

# 3️⃣ Production build test
echo "🏗 Running production build..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ BUILD FAILED — Fix errors above before continuing."
  exit 1
fi

echo "✅ Build passed."

# 4️⃣ Confirm API route exists in build output
echo "🔍 Checking for /api/profile/save route..."
npm run build | grep "/api/profile/save"

if [ $? -ne 0 ]; then
  echo "❌ /api/profile/save NOT FOUND in build routes."
  exit 1
fi

echo "✅ API route detected."

# 5️⃣ Start dev server
echo "🌐 Starting dev server..."
npm run dev &
sleep 5

# 6️⃣ Test API endpoint locally (no token check)
echo "🧪 Testing local API endpoint..."
curl -X POST http://localhost:3000/api/profile/save \
  -H "Contencho "🎯 If you see 401 Not logged in → API is working."
echo "🎯 If you see 404 → Route is broken."
echo ""

# 7️⃣ Git status
echo "📂 Checking git status..."
git status

echo ""
echo "If changes exist and build passed, pushing to main..."
git add -A
git commit -m "final production verification fix" || echo "Nothing to commit"
git push origin main

echo ""
echo "🔥 DONE. Now check Vercel deployment."
echo "======================================"
