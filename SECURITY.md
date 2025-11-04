# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Discord Bot Manager, please report it responsibly:

1. **Do NOT** open a public GitHub issue
2. Email security concerns to the maintainer (see GitHub profile)
3. Include detailed information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

We will acknowledge receipt within 48 hours and aim to provide a fix within 7 days for critical issues.

---

## Security Features

### 1. Authentication & Authorization

- **JWT-based authentication** with configurable expiration
- **bcrypt password hashing** (10 rounds)
- **No default credentials** - setup required
- **Token-based API access** for all protected endpoints

### 2. Input Validation

All user inputs are validated using `express-validator`:

- **Bot creation**: Name, type, script path validation
- **Path traversal prevention**: Blocks `..`, `/etc`, `/root`, `/sys`, `/proc`
- **XSS prevention**: HTML/script tag filtering
- **SQL injection prevention**: Parameterized queries (Sequelize ORM)
- **JSON validation**: Strict JSON parsing for env_vars

### 3. Rate Limiting

Protection against brute force and DoS attacks:

| Endpoint | Limit | Window |
|----------|-------|--------|
| Login (`/api/auth/login`) | 5 requests | 15 minutes |
| Global API | 100 requests | 15 minutes |
| Bot operations | 30 requests | 1 minute |

### 4. CORS Protection

- **No wildcard origins** in production
- Whitelist-based CORS with `ALLOWED_ORIGINS` env var
- Credentials support enabled for authenticated requests

### 5. Security Headers (Helmet.js)

Enabled headers:
- **Content-Security-Policy (CSP)**: Restricts resource loading
- **HTTP Strict Transport Security (HSTS)**: Forces HTTPS (31536000s)
- **X-Frame-Options**: Prevents clickjacking (`SAMEORIGIN`)
- **X-Content-Type-Options**: Prevents MIME sniffing (`nosniff`)
- **X-XSS-Protection**: Browser XSS filter

### 6. Secure File Access

The `/api/parse-env` endpoint implements multiple layers of protection:

```javascript
// Path normalization
const normalizedPath = path.normalize(script_path);

// Blocked patterns:
- .. (parent directory)
- /etc (system config)
- /root (root home)
- /sys (system files)
- /proc (process info)
```

All attempts are logged with IP and user information.

### 7. Structured Logging (Winston)

- **Rotating log files** (5MB max, 5 files retained)
- **Security event logging**: Failed logins, path traversal attempts, rate limit violations
- **Production-safe**: No sensitive data in logs
- **JSON format** for easy parsing and analysis

### 8. Monitoring & Alerting

Prometheus metrics expose:
- HTTP request rates and latency
- Failed authentication attempts (via error logs)
- Bot status changes
- WebSocket connection count

Set up alerts for:
- High error rates
- Unusual bot restart patterns
- Spike in authentication failures

---

## Known Limitations

### 1. SQLite Concurrency

SQLite has limited write concurrency. For high-traffic deployments (1000+ concurrent users), consider PostgreSQL.

### 2. File System Access

The bot manager requires file system access to:
- Read bot scripts
- Parse `.env` files
- Access PM2 logs

**Mitigation**: Run with least-privilege user, restrict file permissions.

### 3. PM2 Process Management

Bot manager interacts with PM2 API which has elevated privileges.

**Mitigation**:
- Run backend as dedicated user (not root)
- Use PM2's built-in security features
- Audit bot script paths before adding

---

## Secure Deployment Checklist

- [ ] Generate strong JWT_SECRET (min 32 characters)
- [ ] Set NODE_ENV=production
- [ ] Configure ALLOWED_ORIGINS (no wildcards)
- [ ] Enable HTTPS/TLS (Let's Encrypt)
- [ ] Use reverse proxy (Nginx/Apache)
- [ ] Enable firewall (UFW/iptables)
- [ ] Restrict /metrics endpoint to monitoring IPs only
- [ ] Set up log rotation
- [ ] Regular backups of bot-manager.db
- [ ] Keep dependencies updated (npm audit)
- [ ] Monitor security advisories
- [ ] Use strong passwords for admin accounts
- [ ] Disable unnecessary services on server
- [ ] Enable fail2ban for SSH brute force protection

---

## Dependency Security

### Automated Scanning

```bash
# Check for vulnerabilities
npm audit

# Fix non-breaking vulnerabilities
npm audit fix

# Fix all (may introduce breaking changes)
npm audit fix --force
```

### Manual Review

Critical dependencies and their security:

| Package | Purpose | Security Notes |
|---------|---------|----------------|
| express | Web framework | Keep updated, use latest |
| helmet | Security headers | Essential for production |
| express-rate-limit | Rate limiting | Protects against brute force |
| express-validator | Input validation | Prevents injection attacks |
| bcrypt | Password hashing | Industry standard (10 rounds) |
| jsonwebtoken | JWT auth | Configure short expiration |
| sequelize | ORM | Prevents SQL injection |
| socket.io | WebSocket | Keep updated for security fixes |
| winston | Logging | Safe, no known vulnerabilities |
| pm2 | Process manager | Run as non-root user |

### Update Strategy

1. **Review changelog** before updating major versions
2. **Test in staging** environment first
3. **Monitor logs** after production deployment
4. **Have rollback plan** ready

---

## Password Policy

While the application doesn't enforce password complexity, we recommend:

- **Minimum 12 characters**
- **Mix of uppercase, lowercase, numbers, symbols**
- **No common passwords** (e.g., "password123")
- **Unique password** (not reused from other services)
- **Consider using a password manager**

For enhanced security, consider implementing:
- Password complexity validation
- Password expiration
- Two-factor authentication (2FA)
- Account lockout after failed attempts

---

## Environment Variables Security

**Never commit `.env` files to version control!**

Add to `.gitignore`:

```
.env
.env.local
.env.*.local
```

**Secure storage options:**
- Environment variables in hosting platform (Heroku, Vercel, etc.)
- Secret management service (AWS Secrets Manager, HashiCorp Vault)
- Encrypted configuration files (ansible-vault, SOPS)

---

## Incident Response Plan

If a security breach occurs:

1. **Contain**: Immediately revoke compromised JWT tokens
2. **Investigate**: Check logs for attack vectors
3. **Remediate**: Apply security patches
4. **Notify**: Inform users if data was compromised
5. **Document**: Write post-mortem report
6. **Improve**: Update security measures

---

## Security Testing

### Manual Security Testing

```bash
# Test rate limiting
for i in {1..10}; do curl -X POST http://localhost:3000/api/auth/login; done

# Test path traversal (should be blocked)
curl -X POST http://localhost:3000/api/parse-env \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"script_path":"../../etc/passwd"}'

# Test CORS (should reject unknown origins)
curl -X GET http://localhost:3000/api/bots \
  -H "Origin: https://evil.com" \
  -H "Authorization: Bearer <token>"
```

### Automated Security Testing

```bash
# Run tests including security tests
npm test

# Dependency vulnerability scan
npm audit

# Optional: OWASP ZAP scan
zap-cli quick-scan --self-contained http://localhost:3000
```

---

## Security Best Practices

1. **Principle of Least Privilege**: Run services with minimal permissions
2. **Defense in Depth**: Multiple layers of security
3. **Fail Secure**: Default to deny access
4. **Keep it Simple**: Avoid unnecessary complexity
5. **Stay Updated**: Regular dependency updates
6. **Monitor Everything**: Logs, metrics, alerts
7. **Test Regularly**: Security audits and penetration testing
8. **Document Changes**: Maintain security changelog

---

## Compliance

This application is designed for self-hosted deployments. For compliance with regulations (GDPR, HIPAA, SOC 2), consider:

- **Data encryption at rest** (encrypt database file)
- **Audit logging** (track all data access)
- **Data retention policies** (automatic log/metric cleanup)
- **Access controls** (role-based permissions)
- **Regular security audits**

---

## Contact

For security concerns:
- Check existing issues: https://github.com/Jackal1337/discord-bot-manager/issues
- Review documentation: [PRODUCTION.md](PRODUCTION.md)
- Contact maintainer through GitHub

**Do not publicly disclose security vulnerabilities without coordination.**

---

Last Updated: 2025-01-15
