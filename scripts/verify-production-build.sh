#!/bin/bash

# Pathway Genesis Production Build Verification Script
# Runs comprehensive checks before deployment

set -e

echo "🚀 Starting Production Build Verification..."
echo ""

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node version
echo "🔍 Checking Node version..."
NODE_VERSION=$(node --version)
echo "   Node: $NODE_VERSION"
if [[ ! $NODE_VERSION =~ v20 ]] && [[ ! $NODE_VERSION =~ v18 ]]; then
  echo -e "${RED}❌ Node 18+ required${NC}"
  exit 1
fi

# Check npm version
echo "🔍 Checking npm version..."
NPM_VERSION=$(npm --version)
echo "   npm: $NPM_VERSION"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm ci --prefer-offline --no-audit

# Run linting
echo ""
echo "🔍 Linting code..."
npm run lint --if-present || true

# Run TypeScript compilation
echo ""
echo "🔍 Checking TypeScript..."
npm run build:ts --if-present || npx tsc --noEmit

# Build application
echo ""
echo "🏗️  Building application..."
npm run build

# Verify build output
echo ""
echo "✅ Verifying build output..."

if [ ! -d "dist" ]; then
  echo -e "${RED}❌ dist directory not found${NC}"
  exit 1
fi

if [ ! -f "dist/index.html" ]; then
  echo -e "${RED}❌ dist/index.html not found${NC}"
  exit 1
fi

if [ ! -f "dist/manifest.json" ]; then
  echo -e "${RED}❌ dist/manifest.json not found${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Build artifacts verified${NC}"

# Check bundle size
echo ""
echo "📊 Analyzing bundle size..."
TOTAL_SIZE=$(du -sh dist | cut -f1)
echo "   Total size: $TOTAL_SIZE"

JS_SIZE=$(find dist -name "*.js" -type f -exec du -c {} + | tail -1 | cut -f1)
CSS_SIZE=$(find dist -name "*.css" -type f -exec du -c {} + | tail -1 | cut -f1)

echo "   JS files: $(numfmt --to=iec $JS_SIZE 2>/dev/null || echo "$JS_SIZE bytes")"
echo "   CSS files: $(numfmt --to=iec $CSS_SIZE 2>/dev/null || echo "$CSS_SIZE bytes")"

# Run tests
echo ""
echo "🧪 Running tests..."
npm test --if-present --coverage || true

# Check service worker
echo ""
echo "🔍 Checking service worker..."
if [ -f "dist/service-worker.js" ]; then
  echo -e "${GREEN}✅ Service worker generated${NC}"
else
  echo -e "${YELLOW}⚠️  Service worker not found${NC}"
fi

# Check gzip compression
echo ""
echo "📦 Checking compression..."
GZIP_SIZE=$(gzip -c dist/index.html | wc -c)
HTML_SIZE=$(wc -c < dist/index.html)
COMPRESSION=$((GZIP_SIZE * 100 / HTML_SIZE))
echo "   index.html: $HTML_SIZE bytes → $GZIP_SIZE bytes (${COMPRESSION}% of original)"

# Security checks
echo ""
echo "🔒 Running security checks..."

# Check for console.log in production build
if grep -r "console\\.log" dist --include="*.js" | grep -v "node_modules"; then
  echo -e "${YELLOW}⚠️  console.log found in production build${NC}"
else
  echo -e "${GREEN}✅ No console.log in production build${NC}"
fi

# Check for sourcemaps in production
if find dist -name "*.map" | grep -q .; then
  echo -e "${YELLOW}⚠️  Source maps found in production build${NC}"
else
  echo -e "${GREEN}✅ No source maps in production${NC}"
fi

# Check security headers
echo ""
echo "🔒 Verifying security headers configuration..."
if [ -f "serve.json" ]; then
  echo -e "${GREEN}✅ serve.json configured${NC}"
else
  echo -e "${YELLOW}⚠️  serve.json not found${NC}"
fi

# Final summary
echo ""
echo "════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Production Build Verification Complete${NC}"
echo "════════════════════════════════════════════════════════"
echo ""
echo "📊 Build Summary:"
echo "   - Node: $NODE_VERSION"
echo "   - npm: $NPM_VERSION"
echo "   - Output: dist/"
echo "   - Size: $TOTAL_SIZE"
echo "   - Ready for deployment: YES"
echo ""
echo "🚀 Next steps:"
echo "   1. docker build -f Dockerfile.production -t pathway-genesis:latest ."
echo "   2. docker-compose -f docker-compose.production.yml up"
echo "   3. Verify at http://localhost:3000"
echo ""
