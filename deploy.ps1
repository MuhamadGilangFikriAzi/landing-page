# SuruhNgoding Deployment Script (PowerShell)
# Update & restart Docker container with latest changes

Write-Host "🔄 Starting deployment..." -ForegroundColor Cyan

# Stop old container
Write-Host "⏹️  Stopping old container..." -ForegroundColor Yellow
docker stop suruhngoding-prod 2>$null
docker rm suruhngoding-prod 2>$null

# Build new image
Write-Host "🏗️  Building Docker image..." -ForegroundColor Yellow
docker build -t suruhngoding:latest .

# Run new container (Cloudflare tunnel expects port 8090)
Write-Host "🚀 Starting new container on port 8090..." -ForegroundColor Yellow
docker run -d `
  -p 8090:80 `
  --name suruhngoding-prod `
  --restart always `
  suruhngoding:latest

# Wait for container to be ready
Start-Sleep -Seconds 2

# Verify
Write-Host "✅ Verifying deployment..." -ForegroundColor Yellow

$html = curl -s http://localhost/index.html
if ($html -match "SuruhNgoding") {
  Write-Host "✓ HTML served correctly" -ForegroundColor Green
}

$css = curl -s http://localhost/design-system.css
if ($css -match "06b6d4") {
  Write-Host "✓ New cyan theme loaded" -ForegroundColor Green
}

$js = curl -s http://localhost/js/main.js
if ($js -match "LANG = {") {
  Write-Host "✓ JS i18n system working" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host "Container: suruhngoding-prod"
Write-Host "Port: 80"
Write-Host "URL: http://localhost"
Write-Host ""
Write-Host "If using Cloudflare Zero Trust Tunnel, it should now reflect changes." -ForegroundColor Cyan
Write-Host "If not, restart your tunnel with: cloudflared tunnel run" -ForegroundColor Cyan
