# Deployment Guide — SuruhNgoding

## Docker Setup (Local)

### Build Image
```bash
cd landing-page
docker build -t suruhngoding:latest .
```

### Run Container
```bash
# Start container with port 8090 mapping (Cloudflare tunnel config)
docker run -d -p 8090:80 --name suruhngoding-prod suruhngoding:latest

# Check if running
docker ps | grep suruhngoding
```

### View Logs
```bash
docker logs suruhngoding-prod -f
```

### Stop Container
```bash
docker stop suruhngoding-prod
docker rm suruhngoding-prod
```

## Update & Redeploy

Setiap kali ada perubahan:

```bash
# 1. Build image baru
docker build -t suruhngoding:latest .

# 2. Stop container lama
docker stop suruhngoding-prod
docker rm suruhngoding-prod

# 3. Run container baru
docker run -d -p 80:80 --name suruhngoding-prod suruhngoding:latest

# 4. Verify
curl http://localhost
```

## Docker Compose (Alternative)

Buat `docker-compose.yml` di root project:

```yaml
version: '3.8'
services:
  suruhngoding:
    build: .
    ports:
      - "80:80"
    restart: always
    container_name: suruhngoding-prod
```

Kemudian:
```bash
docker-compose up -d
docker-compose logs -f
```

## Testing

```bash
# Test HTML
curl http://localhost/index.html | head -20

# Test CSS (verify cyan color #06b6d4)
curl http://localhost/design-system.css | grep "06b6d4"

# Test JS
curl http://localhost/js/main.js | head -10

# Test Promo page
curl http://localhost/promo.html | head -20
```

## Image Info

- **Base**: nginx:alpine (92.8 MB total, ~26 MB compressed)
- **Includes**: HTML, CSS, JS, Promo page, robots.txt, sitemap.xml
- **Config**: nginx.conf dengan gzip compression + cache headers

## Production Checklist

- [ ] Update GA tracking ID (currently G-XXXXXXXXXX)
- [ ] Update og:image URL
- [ ] Test multilingual (ID/EN toggle)
- [ ] Test all CTA buttons → WhatsApp
- [ ] Test promo countdown timer
- [ ] Verify mobile responsiveness
- [ ] Check performance (gzip working)
- [ ] Monitor logs for errors

## Cleanup Old Containers

```bash
docker ps -a | grep suruhngoding  # List all
docker rm <container_id>           # Remove specific
docker image prune                 # Remove unused images
```

---

**Last Updated**: 2026-05-25  
**Theme**: Blue/Cyan (#06b6d4)  
**Status**: Production Ready ✅
