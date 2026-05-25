#!/bin/bash
# SuruhNgoding Deployment Script
# Update & restart Docker container with latest changes

set -e

echo "🔄 Starting deployment..."

# Stop old container
echo "⏹️  Stopping old container..."
docker stop suruhngoding-prod 2>/dev/null || true
docker rm suruhngoding-prod 2>/dev/null || true

# Build new image
echo "🏗️  Building Docker image..."
docker build -t suruhngoding:latest .

# Run new container (Cloudflare tunnel expects port 8090)
echo "🚀 Starting new container on port 8090..."
docker run -d \
  -p 8090:80 \
  --name suruhngoding-prod \
  --restart always \
  suruhngoding:latest

# Wait for container to be ready
sleep 2

# Verify
echo "✅ Verifying deployment..."
if curl -s http://localhost/index.html | grep -q "SuruhNgoding"; then
  echo "✓ HTML served correctly"
fi

if curl -s http://localhost/design-system.css | grep -q "06b6d4"; then
  echo "✓ New cyan theme loaded"
fi

if curl -s http://localhost/js/main.js | grep -q "LANG = {"; then
  echo "✓ JS i18n system working"
fi

echo ""
echo "🎉 Deployment complete!"
echo "Container: suruhngoding-prod"
echo "Port: 80"
echo "URL: http://localhost"
echo ""
echo "If using Cloudflare Zero Trust Tunnel, it should now reflect changes."
echo "If not, restart your tunnel with: cloudflared tunnel run"
