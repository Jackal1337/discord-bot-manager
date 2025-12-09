# Production Deployment Guide

This guide covers deploying the Discord Bot Manager in a production environment with security best practices.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Security Hardening](#security-hardening)
- [Environment Configuration](#environment-configuration)
- [SSL/TLS Setup](#ssltls-setup)
- [Reverse Proxy Setup (Nginx)](#reverse-proxy-setup-nginx)
- [Monitoring & Alerting](#monitoring--alerting)
- [Backup Strategy](#backup-strategy)
- [Performance Optimization](#performance-optimization)

---

## Prerequisites

- **Node.js 18+** installed
- **PM2** installed globally: `npm install -g pm2`
- **Nginx** (or Apache) for reverse proxy
- **SQLite3** for database
- **SSL Certificate** (Let's Encrypt recommended)
- **Firewall** (ufw, iptables, or cloud provider firewall)

---

## Security Hardening

### 1. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cd backend
cp .env.example .env
```

**Critical variables:**

```env
NODE_ENV=production
PORT=3000
DB_PATH=../bot-manager.db
JWT_SECRET=$(openssl rand -base64 32)
ALLOWED_ORIGINS=https://your-domain.com
LOG_LEVEL=warn
```

⚠️ **NEVER commit `.env` to version control!**

### 2. CORS Configuration

In production, restrict CORS to only your domains:

```env
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

The wildcard `*` is **DISABLED** by default for security.

### 3. Rate Limiting

Built-in rate limiting protects against:
- **Login attempts**: 5 per 15 minutes
- **API requests**: 100 per 15 minutes
- **Bot operations**: 30 per minute

Adjust in `backend/securityMiddleware.js` if needed.

### 4. Security Headers

Helmet.js is enabled by default with:
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options

### 5. Input Validation

All inputs are validated using `express-validator`:
- Path traversal prevention
- SQL injection prevention
- XSS prevention
- JSON validation

### 6. File System Access

The `/api/parse-env` endpoint has strict path validation:
- No `..` (parent directory access)
- No `/etc`, `/root`, `/sys`, `/proc` access
- All paths are normalized and validated

---

## Environment Configuration

### Production `.env` Template

```env
# Server
NODE_ENV=production
PORT=3000

# Database
DB_PATH=../bot-manager.db

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-very-secure-random-secret-minimum-32-chars

# CORS (your production domains)
ALLOWED_ORIGINS=https://botmanager.yourdomain.com

# Logging
LOG_LEVEL=warn

# Optional: If using PM2 with ecosystem.config.js
PM2_PUBLIC_KEY=your_pm2_key
PM2_SECRET_KEY=your_pm2_secret
```

---

## SSL/TLS Setup

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d botmanager.yourdomain.com

# Auto-renewal is set up automatically
sudo certbot renew --dry-run
```

---

## Reverse Proxy Setup (Nginx)

### Install Nginx

```bash
sudo apt-get install nginx
```

### Configuration

Create `/etc/nginx/sites-available/bot-manager`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name botmanager.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name botmanager.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/botmanager.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/botmanager.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend (React build)
    root /var/www/bot-manager/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket (Socket.IO)
    location /socket.io {
        proxy_pass http://localhost:3000/socket.io;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Prometheus Metrics (restrict to localhost or monitoring IP)
    location /metrics {
        proxy_pass http://localhost:3000/metrics;
        allow 127.0.0.1;
        allow YOUR_MONITORING_SERVER_IP;
        deny all;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/bot-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Monitoring & Alerting

### Prometheus Metrics

The backend exposes Prometheus metrics at `/metrics`:

**Available Metrics:**
- `http_request_duration_seconds` - HTTP request latency
- `http_requests_total` - Total HTTP requests
- `websocket_connections_active` - Active WebSocket connections
- `bot_status` - Bot online/offline status (1=online, 0=offline)
- `bot_cpu_usage_percent` - Bot CPU usage
- `bot_memory_usage_bytes` - Bot memory usage
- `bot_restarts_total` - Bot restart counter
- Default Node.js metrics (memory, CPU, event loop, etc.)

### Prometheus Configuration

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'bot-manager'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:3000']
```

### Grafana Dashboard

Import or create a dashboard with panels for:
- Total bots (online/offline)
- CPU usage per bot
- Memory usage per bot
- HTTP request rate
- WebSocket connections
- Bot restart events

### Health Check Monitoring

Use the `/api/health` endpoint for uptime monitoring:

```bash
curl https://botmanager.yourdomain.com/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "message": "Bot Manager API běží",
  "database": "connected",
  "demo": false,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

Set up monitoring with:
- **UptimeRobot**
- **Pingdom**
- **Datadog**
- **Custom script with cron**

---

## Backup Strategy

### Database Backup

SQLite database is a single file - easy to backup:

```bash
#!/bin/bash
# /usr/local/bin/backup-bot-manager.sh

BACKUP_DIR="/var/backups/bot-manager"
DB_PATH="/var/www/bot-manager/bot-manager.db"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Create backup
cp $DB_PATH "$BACKUP_DIR/bot-manager_$DATE.db"

# Keep only last 30 days
find $BACKUP_DIR -name "bot-manager_*.db" -mtime +30 -delete

# Optional: Upload to S3
# aws s3 cp "$BACKUP_DIR/bot-manager_$DATE.db" s3://your-bucket/backups/
```

Add to cron (daily at 2 AM):

```bash
crontab -e
0 2 * * * /usr/local/bin/backup-bot-manager.sh
```

### Log Rotation

Winston logs are in `backend/logs/`:

Configure logrotate in `/etc/logrotate.d/bot-manager`:

```
/var/www/bot-manager/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload pm2-www-data > /dev/null 2>&1 || true
    endscript
}
```

---

## Performance Optimization

### 1. Database Indexing

Already optimized with indexes on:
- `bots.pm2_name`
- `bots.created_at`
- `deploy_history.bot_id, timestamp`
- `bot_metrics.bot_id, timestamp`

### 2. WebSocket Optimization

Current implementation broadcasts to all clients every 3 seconds. For large deployments, consider:

- **Socket.IO Rooms**: Group clients by bot ID
- **Redis Adapter**: For horizontal scaling
- **Increase interval**: Change from 3s to 5s or 10s

### 3. PM2 Cluster Mode

Run backend in cluster mode for better CPU utilization:

```bash
pm2 start server.js -i max --name bot-manager-backend
```

Or use `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'bot-manager-backend',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

### 4. Frontend Optimization

- Build with production flag: `npm run build`
- Enable Nginx gzip compression
- Use CDN for static assets (optional)
- Enable browser caching

### 5. Database Optimization

For very large deployments (1000+ bots), consider:
- PostgreSQL instead of SQLite
- Separate read replicas
- Connection pooling

---

## Testing

### Run Tests

```bash
cd backend
npm test
```

### Test Coverage

```bash
npm run test:ci
```

Current coverage: **15 tests passing** with validation, rate limiting, and health check coverage.

---

## Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `JWT_SECRET`
- [ ] Configure `ALLOWED_ORIGINS` (no wildcards)
- [ ] Set up SSL/TLS certificates
- [ ] Configure Nginx reverse proxy
- [ ] Enable firewall (only 80, 443, SSH)
- [ ] Set up database backups
- [ ] Configure log rotation
- [ ] Enable Prometheus monitoring
- [ ] Test health check endpoint
- [ ] Run security audit: `npm audit`
- [ ] Test rate limiting
- [ ] Verify CORS restrictions
- [ ] Test WebSocket connections
- [ ] Create first admin user
- [ ] Document credentials securely

---

## Troubleshooting

### Logs Location

- **Application logs**: `backend/logs/combined.log`
- **Error logs**: `backend/logs/error.log`
- **Nginx logs**: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- **PM2 logs**: `pm2 logs bot-manager-backend`

### Common Issues

**1. CORS errors in browser:**
- Check `ALLOWED_ORIGINS` in `.env`
- Verify frontend is using correct API URL

**2. Database locked:**
- SQLite doesn't handle high concurrency well
- Consider PostgreSQL for production

**3. WebSocket connection failed:**
- Check Nginx WebSocket proxy configuration
- Verify firewall allows WebSocket connections

**4. High memory usage:**
- Check bot metrics for memory leaks
- Restart bots with high memory usage
- Consider memory limits in PM2

---

## Support & Updates

- **Documentation**: [README.md](README.md)
- **GitHub**: https://github.com/Jackal1337/discord-bot-manager
- **Issues**: https://github.com/Jackal1337/discord-bot-manager/issues

---

**Security Note**: Always keep dependencies updated:

```bash
npm audit
npm audit fix
npm update
```

Monitor [GitHub Security Advisories](https://github.com/advisories) for vulnerabilities.
