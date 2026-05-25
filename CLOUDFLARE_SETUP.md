# Cloudflare Zero Trust Tunnel Setup

## Verify Tunnel Configuration

### 1. Check Cloudflare Tunnel Status

```bash
# View running tunnel
cloudflared tunnel list

# Check specific tunnel
cloudflared tunnel info <tunnel-id>

# View tunnel config
cat ~/.cloudflared/config.yml
```

### 2. Verify Docker Container Port

Container harus running di **port 80**:

```bash
docker ps | grep suruhngoding
# Output: ...0.0.0.0:80->80/tcp...
```

### 3. Test Local Access

```bash
curl http://localhost
curl http://localhost/design-system.css | grep "06b6d4"
```

## Config File Example

Tunnel config (`~/.cloudflared/config.yml`) harus point ke localhost:80:

```yaml
tunnel: suruhngoding
credentials-file: ~/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: suruhngoding.com
    service: http://localhost:80
  - hostname: www.suruhngoding.com
    service: http://localhost:80
  - service: http_status:404
```

## Deployment Workflow

### Quick Update (Bash)

```bash
cd ~/landing-page
bash deploy.sh
```

### Or Manual Steps

```bash
# 1. Stop & remove old container
docker stop suruhngoding-prod
docker rm suruhngoding-prod

# 2. Build new image
docker build -t suruhngoding:latest .

# 3. Run container
docker run -d -p 80:80 --name suruhngoding-prod suruhngoding:latest

# 4. Verify
curl http://localhost | head -20
```

### Or Docker Compose

```bash
docker-compose up -d --build
docker-compose logs -f
```

## If Changes Not Appearing

**Option 1: Tunnel Restart**
```bash
# Restart tunnel (graceful)
cloudflared tunnel run suruhngoding

# Or kill and restart
pkill cloudflared
cloudflared tunnel run suruhngoding
```

**Option 2: Browser Cache**
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear cookies/cache
- Try incognito window

**Option 3: Verify Everything**
```bash
# Check container
docker ps | grep suruhngoding

# Check port
lsof -i :80  # or: netstat -tlnp | grep 80

# Check CSS theme
curl http://localhost/design-system.css | grep "06b6d4"

# Check tunnel
cloudflared tunnel status suruhngoding
```

## Troubleshooting

### Container Not Starting?
```bash
docker logs suruhngoding-prod
```

### Port 80 Already in Use?
```bash
# Find what's using port 80
lsof -i :80

# Kill it or use different port:
docker run -d -p 8080:80 --name suruhngoding-prod suruhngoding:latest
# Update Cloudflare to: http://localhost:8080
```

### Tunnel Connection Failed?
```bash
# Check tunnel logs
cloudflared tunnel validate

# Re-authenticate if needed
cloudflared tunnel login
```

### Still Old Version After Deploy?
- Check container is actually running new image
- `docker images` — verify latest image exists
- `docker inspect suruhngoding-prod` — check created time
- Browser: Hard refresh + clear cache
- Cloudflare: Clear cache in dashboard

## Deployment Checklist

- [ ] Container running: `docker ps | grep suruhngoding`
- [ ] Port 80 bound: `curl http://localhost`
- [ ] New theme loaded: CSS has `#06b6d4`
- [ ] JS working: Console shows no errors
- [ ] Tunnel running: `cloudflared tunnel status`
- [ ] Browser cache cleared
- [ ] Cloudflare cache cleared (if needed)
- [ ] Test on phone (different network)

---

**Theme**: Blue/Cyan (#06b6d4)  
**Last Updated**: 2026-05-25  
**Status**: Production Ready ✅
