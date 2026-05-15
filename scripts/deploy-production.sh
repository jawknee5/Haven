#!/bin/bash

# Pathway Genesis Production Deployment Script
# Orchestrates Docker build, push, and deployment

set -e

echo "🚀 Pathway Genesis Production Deployment"
echo "════════════════════════════════════════════════════════"

# Configuration
REGISTRY="${REGISTRY:-ghcr.io}"
IMAGE_NAME="${IMAGE_NAME:-pathway-genesis/frontend}"
DOCKER_TAG="${1:-latest}"
DEPLOY_HOST="${DEPLOY_HOST:-prod-server.pathway.com}"
DEPLOY_USER="${DEPLOY_USER:-deploy}"

# Color output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "📋 Deployment Configuration:"
echo "   Registry: $REGISTRY"
echo "   Image: $IMAGE_NAME"
echo "   Tag: $DOCKER_TAG"
echo "   Deploy Host: $DEPLOY_HOST"
echo ""

# Step 1: Verify build
echo "1️⃣  Verifying production build..."
bash scripts/verify-production-build.sh

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Build verification failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Build verified${NC}"
echo ""

# Step 2: Build Docker image
echo "2️⃣  Building Docker image..."
docker build \
  -f Dockerfile.production \
  -t $REGISTRY/$IMAGE_NAME:$DOCKER_TAG \
  -t $REGISTRY/$IMAGE_NAME:latest \
  .

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Docker build failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Docker image built${NC}"
echo ""

# Step 3: Scan image for vulnerabilities
echo "3️⃣  Scanning Docker image for vulnerabilities..."
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image --severity HIGH,CRITICAL \
  $REGISTRY/$IMAGE_NAME:$DOCKER_TAG || true

echo ""

# Step 4: Push image
echo "4️⃣  Pushing Docker image to registry..."
docker push $REGISTRY/$IMAGE_NAME:$DOCKER_TAG
docker push $REGISTRY/$IMAGE_NAME:latest

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Docker push failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Docker image pushed${NC}"
echo ""

# Step 5: Deploy to production
if [ -z "$SKIP_DEPLOY" ]; then
  echo "5️⃣  Deploying to production..."
  
  # Check if deploy key exists
  if [ ! -f ~/.ssh/deploy_key ]; then
    echo -e "${YELLOW}⚠️  Deploy key not found. Skipping remote deployment.${NC}"
    echo "   Set up SSH key at ~/.ssh/deploy_key for automated deployment"
  else
    ssh -i ~/.ssh/deploy_key $DEPLOY_USER@$DEPLOY_HOST <<EOF
      set -e
      cd /app
      
      echo "Pulling latest image..."
      docker pull $REGISTRY/$IMAGE_NAME:latest
      
      echo "Stopping old container..."
      docker-compose -f docker-compose.production.yml down || true
      
      echo "Starting new container..."
      docker-compose -f docker-compose.production.yml up -d
      
      echo "Cleaning up..."
      docker system prune -f
      
      echo "Deployment complete"
EOF
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}❌ Remote deployment failed${NC}"
      exit 1
    fi
    
    echo -e "${GREEN}✅ Deployed to production${NC}"
  fi
else
  echo -e "${YELLOW}⏭️  Skipping remote deployment (SKIP_DEPLOY=true)${NC}"
fi

echo ""

# Step 6: Health check
echo "6️⃣  Running health checks..."
sleep 10

for i in {1..30}; do
  if curl -sf https://pathway-genesis.com/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    break
  fi
  
  if [ $i -eq 30 ]; then
    echo -e "${RED}❌ Health check timeout${NC}"
    exit 1
  fi
  
  echo "   Attempt $i/30..."
  sleep 5
done

echo ""
echo "════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Production Deployment Complete${NC}"
echo "════════════════════════════════════════════════════════"
echo ""
echo "📊 Deployment Summary:"
echo "   Image: $REGISTRY/$IMAGE_NAME:$DOCKER_TAG"
echo "   Status: ✅ Running"
echo "   URL: https://pathway-genesis.com"
echo ""
