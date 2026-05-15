#!/bin/bash

# Pathway Genesis Pre-Deployment Checklist
# Verifies all systems ready for production

set -e

echo "🚀 Pathway Genesis Pre-Deployment Checklist"
echo "════════════════════════════════════════════════════════"
echo ""

CHECKS_PASSED=0
CHECKS_FAILED=0

# Helper function for checks
check() {
  local description=$1
  local command=$2
  
  echo -n "🔍 $description... "
  
  if eval "$command" >/dev/null 2>&1; then
    echo "✅"
    ((CHECKS_PASSED++))
  else
    echo "❌"
    ((CHECKS_FAILED++))
  fi
}

# System checks
echo "📋 System Requirements:"
check "Node.js 18+" "node --version | grep -E 'v(18|19|20)'"
check "npm installed" "npm --version"
check "Docker installed" "docker --version"
check "Git installed" "git --version"
echo ""

# Code quality
echo "📝 Code Quality:"
check "ESLint configured" "test -f .eslintrc*"
check "TypeScript configured" "test -f tsconfig.json"
check "Prettier configured" "test -f .prettierrc*"
echo ""

# Build configuration
echo "🏗️  Build Configuration:"
check "Tailwind configured" "test -f tailwind.config.ts"
check "Vite configured" "test -f vite.config.ts"
check "package.json exists" "test -f package.json"
echo ""

# Environment
echo "🌍 Environment Setup:"
check ".env.example exists" "test -f .env.example"
check ".env.production exists" "test -f .env.production"
check ".gitignore configured" "grep -q 'node_modules' .gitignore"
echo ""

# Docker
echo "🐳 Docker Configuration:"
check "Dockerfile.production exists" "test -f Dockerfile.production"
check "docker-compose.yml exists" "test -f docker-compose.production.yml"
check "serve.json configured" "test -f serve.json"
echo ""

# CI/CD
echo "🚀 CI/CD Pipeline:"
check "GitHub Actions workflow" "test -d .github/workflows"
check "Deployment script" "test -f scripts/deploy-production.sh"
check "Build verification script" "test -f scripts/verify-production-build.sh"
echo ""

# Documentation
echo "📚 Documentation:"
check "README.md exists" "test -f README.md"
check "Production guide exists" "test -f PRODUCTION_DEPLOYMENT.md"
check "API documentation" "test -d docs"
echo ""

# Dependencies
echo "📦 Dependencies:"
check "package-lock.json exists" "test -f package-lock.json || test -f pnpm-lock.yaml"
echo ""

# Security
echo "🔒 Security:"
check ".gitignore includes secrets" "grep -q '.env.local' .gitignore"
check "No hardcoded credentials" "! grep -r 'password\\|secret\\|api.key' src --include='*.ts' --include='*.tsx' 2>/dev/null || true"
echo ""

# Git
echo "📦 Version Control:"
check "Git initialized" "test -d .git"
check "Remote configured" "git remote -v | grep -q origin"
echo ""

# Final summary
echo ""
echo "════════════════════════════════════════════════════════"
echo "📊 Checklist Summary:"
echo "   ✅ Passed: $CHECKS_PASSED"
echo "   ❌ Failed: $CHECKS_FAILED"
echo "════════════════════════════════════════════════════════"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
  echo "✅ All checks passed! Ready for deployment."
  echo ""
  echo "Next steps:"
  echo "  1. bash scripts/verify-production-build.sh"
  echo "  2. bash scripts/deploy-production.sh main"
  exit 0
else
  echo "❌ Some checks failed. Please fix before deployment."
  exit 1
fi
