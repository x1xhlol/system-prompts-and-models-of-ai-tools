# 🚢 Lovable Clone - Complete Deployment Guide

> Step-by-step production deployment với Vercel + Supabase

---

# 📑 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Supabase Production Setup](#supabase-production-setup)
3. [Vercel Deployment](#vercel-deployment)
4. [Domain & SSL](#domain--ssl)
5. [Environment Variables](#environment-variables)
6. [Database Backups](#database-backups)
7. [Monitoring Setup](#monitoring-setup)
8. [Post-Deployment](#post-deployment)

---

# ✅ I. PRE-DEPLOYMENT CHECKLIST

## 1. Code Quality

```bash
# Run all checks
npm run lint
npm run type-check
npm run test:unit
npm run test:e2e
npm run build

# Check bundle size
npx @next/bundle-analyzer
```

## 2. Security Audit

```bash
# Check for vulnerabilities
npm audit

# Fix if possible
npm audit fix

# Check for outdated packages
npm outdated

# Update safely
npm update
```

## 3. Performance Audit

```bash
# Run Lighthouse
npx lighthouse https://your-staging-url.vercel.app \
  --output=html \
  --output-path=./lighthouse-report.html

# Aim for:
# - Performance: > 90
# - Accessibility: > 95
# - Best Practices: > 95
# - SEO: > 95
```

## 4. Configuration Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Storage buckets created
- [ ] Realtime enabled
- [ ] Email templates configured
- [ ] Webhook endpoints ready
- [ ] Rate limiting configured
- [ ] Analytics integrated
- [ ] Error tracking setup
- [ ] Backup strategy in place

---

# 🗄️ II. SUPABASE PRODUCTION SETUP

## 1. Create Production Project

```bash
# Go to https://supabase.com
# Click "New Project"
# Choose:
# - Organization
# - Project name: lovable-production
# - Database password: Use strong password (save it!)
# - Region: Choose closest to users
# - Pricing plan: Pro (recommended)
```

## 2. Run Database Migrations

```sql
-- Copy from supabase/migrations/00000000000000_initial_schema.sql
-- Paste into SQL Editor
-- Click "Run"

-- Verify tables created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Check RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

## 3. Configure Authentication

```bash
# In Supabase Dashboard:
# Authentication > Providers

# Enable Email
- Confirm Email: ON
- Double Confirm: OFF
- Secure Email Change: ON

# Enable Google OAuth
- Client ID: [Google Cloud Console]
- Client Secret: [Google Cloud Console]
- Redirect URL: https://[project-ref].supabase.co/auth/v1/callback

# Enable GitHub OAuth
- Client ID: [GitHub OAuth Apps]
- Client Secret: [GitHub OAuth Apps]
- Redirect URL: https://[project-ref].supabase.co/auth/v1/callback
```

## 4. Setup Storage

```bash
# Storage > Create Bucket

Bucket name: project-assets
Public: Yes
File size limit: 10 MB
Allowed MIME types: image/*, application/zip

# Set RLS policies for bucket
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view files"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-assets');

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 5. Enable Realtime

```sql
-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE project_files;
ALTER PUBLICATION supabase_realtime ADD TABLE deployments;

-- Verify
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
```

## 6. Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link production project
supabase link --project-ref your-production-ref

# Deploy functions
supabase functions deploy chat-completion
supabase functions deploy generate-code

# Set secrets
supabase secrets set \
  OPENAI_API_KEY=sk-... \
  ANTHROPIC_API_KEY=sk-ant-... \
  --project-ref your-production-ref
```

---

# 🚀 III. VERCEL DEPLOYMENT

## 1. Connect Repository

```bash
# Go to https://vercel.com
# Click "Add New Project"
# Import Git Repository
# Select your GitHub repo
```

## 2. Configure Build Settings

```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm ci

Node.js Version: 18.x
```

## 3. Environment Variables

```env
# Production environment variables
NEXT_PUBLIC_SUPABASE_URL=https://[your-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Service role (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI Keys
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Email
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=your-org
SENTRY_PROJECT=lovable-clone

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Rate Limiting
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# GitHub Integration (optional)
GITHUB_TOKEN=ghp_...
GITHUB_WEBHOOK_SECRET=...

# Deployment
VERCEL_TOKEN=...
NETLIFY_TOKEN=...
```

## 4. Deploy

```bash
# First deployment
git push origin main

# Or manual deploy
vercel --prod

# Check deployment
vercel ls
```

## 5. Post-Deploy Verification

```bash
# Test endpoints
curl https://your-domain.com/api/health

# Check SSR
curl https://your-domain.com

# Test authentication
# Visit https://your-domain.com/login

# Test Supabase connection
# Try signing up a user

# Check Realtime
# Open browser console, should see WebSocket connection
```

---

# 🌐 IV. DOMAIN & SSL

## 1. Add Custom Domain

```bash
# In Vercel Dashboard:
# Settings > Domains > Add

# Add your domain:
yourdomain.com
www.yourdomain.com

# Vercel will provide DNS records
```

## 2. Configure DNS

```
# Add these records to your DNS provider:

Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com

# For Supabase custom domain (optional):
Type: CNAME
Name: api
Value: [your-ref].supabase.co
```

## 3. SSL Certificate

```
# Vercel automatically provisions SSL
# Check in Vercel Dashboard > Domains
# Should show: "SSL Certificate Valid"

# Force HTTPS redirect
# Already handled by next.config.js headers
```

---

# 🔐 V. ENVIRONMENT MANAGEMENT

## 1. Vercel Environment Setup

```bash
# Production
NEXT_PUBLIC_SUPABASE_URL=production-url
SUPABASE_SERVICE_ROLE_KEY=production-key

# Preview (for PRs)
NEXT_PUBLIC_SUPABASE_URL=staging-url
SUPABASE_SERVICE_ROLE_KEY=staging-key

# Development (local)
NEXT_PUBLIC_SUPABASE_URL=local-url
SUPABASE_SERVICE_ROLE_KEY=local-key
```

## 2. Secrets Management

```bash
# Use Vercel CLI to set secrets
vercel env add STRIPE_SECRET_KEY production

# Or use Vercel Dashboard
# Settings > Environment Variables

# Never commit secrets to git!
# Add to .gitignore:
.env*.local
.env.production
```

---

# 💾 VI. DATABASE BACKUPS

## 1. Automated Backups (Supabase Pro)

```bash
# Supabase automatically backs up:
# - Daily backups: 7 days retention
# - Weekly backups: 4 weeks retention
# - Monthly backups: 3 months retention

# Enable in Supabase Dashboard:
# Database > Backups > Enable
```

## 2. Manual Backup Script

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
PROJECT_REF="your-project-ref"

mkdir -p $BACKUP_DIR

# Backup database
supabase db dump \
  --project-ref $PROJECT_REF \
  --password $DB_PASSWORD \
  > $BACKUP_DIR/db_$DATE.sql

# Backup storage
supabase storage download \
  --project-ref $PROJECT_REF \
  --bucket project-assets \
  --output $BACKUP_DIR/storage_$DATE.tar.gz

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/ s3://your-backup-bucket/ --recursive

echo "Backup completed: $DATE"
```

## 3. Point-in-Time Recovery

```sql
-- Supabase Pro includes PITR
-- Can restore to any point in last 7 days

-- To restore:
-- 1. Go to Supabase Dashboard
-- 2. Database > Backups
-- 3. Click "Restore"
-- 4. Select timestamp
-- 5. Confirm
```

---

# 📊 VII. MONITORING SETUP

## 1. Vercel Analytics

```typescript
// Already enabled in layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## 2. Sentry Setup

```bash
# Install Sentry
npm install @sentry/nextjs

# Run Sentry wizard
npx @sentry/wizard@latest -i nextjs

# Configure in sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
});
```

## 3. Uptime Monitoring

```bash
# Use services like:
# - UptimeRobot (https://uptimerobot.com)
# - Pingdom
# - Better Uptime

# Monitor endpoints:
- https://yourdomain.com (main site)
- https://yourdomain.com/api/health (API health)
- https://[ref].supabase.co (database)
```

## 4. Performance Monitoring

```bash
# Lighthouse CI
npm install -g @lhci/cli

# Create lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['https://yourdomain.com'],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};

# Run in CI
lhci autorun
```

---

# 🎯 VIII. POST-DEPLOYMENT

## 1. Smoke Tests

```bash
# Test critical paths
curl -f https://yourdomain.com || exit 1
curl -f https://yourdomain.com/api/health || exit 1

# Test authentication
# - Sign up new user
# - Sign in
# - Create project
# - Send chat message
# - Generate code
```

## 2. Performance Baseline

```bash
# Run Lighthouse
# Save scores for comparison

Performance: ___
Accessibility: ___
Best Practices: ___
SEO: ___
```

## 3. Set Up Alerts

```yaml
# alerts.yml
alerts:
  - name: Error Rate High
    condition: error_rate > 5%
    notify: email, slack

  - name: Response Time Slow
    condition: p95_response_time > 2s
    notify: email

  - name: Database Connection Issues
    condition: db_connection_failures > 0
    notify: pagerduty

  - name: High Traffic
    condition: requests_per_minute > 10000
    notify: slack
```

## 4. Documentation

```markdown
# Create DEPLOYMENT.md

## Production URLs

- Main Site: https://yourdomain.com
- API: https://yourdomain.com/api
- Dashboard: https://yourdomain.com/dashboard

## Deployment Process

1. Create PR
2. Wait for CI checks
3. Merge to main
4. Automatic deploy to production
5. Run smoke tests
6. Monitor for errors

## Rollback Procedure

1. Go to Vercel dashboard
2. Find previous deployment
3. Click "Promote to Production"
4. Verify deployment

## Emergency Contacts

- On-call: +1-xxx-xxx-xxxx
- Slack: #alerts
- Email: oncall@company.com
```

---

# 🔥 IX. DISASTER RECOVERY

## 1. Incident Response Plan

```markdown
## Severity Levels

**P0 - Critical**

- Site completely down
- Data loss occurring
- Security breach
- Response time: Immediate

**P1 - High**

- Major features broken
- Performance degraded >50%
- Response time: 15 minutes

**P2 - Medium**

- Minor features broken
- Performance degraded <50%
- Response time: 2 hours

**P3 - Low**

- Cosmetic issues
- Response time: 24 hours
```

## 2. Recovery Procedures

```bash
# Database Recovery
1. Identify issue
2. Stop writes if needed
3. Restore from backup
4. Verify data integrity
5. Resume normal operations

# Application Recovery
1. Roll back deployment
2. Check logs
3. Fix issue
4. Deploy fix
5. Verify

# Data Center Failover
1. Switch DNS to backup region
2. Activate read replicas
3. Restore write capability
4. Monitor performance
```

## 3. Communication Plan

```
Internal:
- Post in #incidents Slack channel
- Email stakeholders
- Update status page

External:
- Update status.yourdomain.com
- Tweet from @yourcompany
- Email affected users
```

---

# 📋 X. PRODUCTION CHECKLIST

## Launch Day

- [ ] All tests passing
- [ ] Database backups verified
- [ ] Monitoring alerts configured
- [ ] Error tracking working
- [ ] Analytics tracking
- [ ] SSL certificate valid
- [ ] Custom domain configured
- [ ] Email sending works
- [ ] Webhooks configured
- [ ] Rate limiting active
- [ ] RLS policies enabled
- [ ] API keys secured
- [ ] Documentation updated
- [ ] Team trained
- [ ] Support ready

## Week 1

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Optimize slow queries
- [ ] Address quick wins
- [ ] Update documentation

## Month 1

- [ ] Review analytics
- [ ] Plan improvements
- [ ] Security audit
- [ ] Cost optimization
- [ ] Scale planning

---

# 🎓 XI. MAINTENANCE

## Daily

```bash
# Check dashboards
- Vercel Analytics
- Sentry errors
- Supabase logs
- PostHog events

# Review metrics
- Active users
- Error rate
- Response time
- Database size
```

## Weekly

```bash
# Update dependencies
npm update

# Review performance
- Lighthouse scores
- Web Vitals
- Bundle size

# Check backups
- Verify last backup
- Test restore
```

## Monthly

```bash
# Security audit
npm audit
npm outdated

# Cost review
- Vercel usage
- Supabase usage
- Third-party services

# Capacity planning
- Database growth
- Storage usage
- API calls
```

---

**🎉 Congratulations! Your Lovable Clone is now production-ready and deployed!**

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

## Need Help?

- GitHub Issues: https://github.com/your-repo/issues
- Discord: https://discord.gg/your-server
- Email: support@yourdomain.com
