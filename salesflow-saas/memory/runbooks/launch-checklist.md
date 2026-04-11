# Launch Day Checklist — Dealix

**Last Updated**: 2026-04-11
**Target**: Public SaaS launch in Saudi Arabia

---

## T-7 Days: Pre-Launch Preparation

### Technical Readiness
- [ ] All services healthy on production environment
- [ ] SSL certificates valid (check: `openssl s_client -connect api.dealix.sa:443`)
- [ ] CDN configured for static assets (frontend build, images, fonts)
- [ ] Database backups running hourly with verified restore procedure
- [ ] Redis persistence enabled and tested
- [ ] Celery workers scaled for expected load (minimum 2 workers)
- [ ] Rate limiting active on all public endpoints
- [ ] DDoS protection enabled (Cloudflare or equivalent)
- [ ] DNS TTL lowered to 60s (for quick failover if needed)
- [ ] WebSocket connection verified for real-time features
- [ ] Celery Beat scheduler running all periodic tasks
- [ ] CORS configured for production domain only

### Load Testing
- [ ] API endpoints tested at 2x expected concurrent users
- [ ] WhatsApp message throughput tested (UltraMSG rate limits verified)
- [ ] Database connection pool handles peak load
- [ ] Frontend loads within 3 seconds on Saudi mobile networks (STC, Mobily, Zain)
- [ ] File upload works for expected attachment sizes (up to 10MB)

### Staging Final Validation
- [ ] Full user journey tested on staging: signup -> onboard -> create lead -> qualify -> deal -> close
- [ ] All AI features tested with Arabic input
- [ ] WhatsApp integration sends and receives messages
- [ ] Payment flow tested with Stripe test cards
- [ ] Email notifications delivered and readable in Arabic

---

## T-3 Days: Content & Legal

### Product: Arabic UI Review
- [ ] All pages reviewed for correct RTL layout on desktop
- [ ] All pages reviewed for RTL layout on mobile (iPhone Safari, Android Chrome)
- [ ] Arabic typography: font size readable, line height comfortable
- [ ] Arabic UI reviewed by native speaker for natural phrasing
- [ ] Form validation messages display in Arabic
- [ ] Error pages (404, 500) have Arabic content
- [ ] Loading states and empty states have Arabic text
- [ ] Date picker supports Hijri calendar option
- [ ] Currency consistently displayed as SAR throughout

### Product: Critical Flow Testing
- [ ] **Signup flow**: Email verification, tenant creation, first login
- [ ] **Onboarding**: Register -> first lead -> first message (complete journey)
- [ ] **Lead management**: Create, edit, qualify, convert to deal
- [ ] **Deal pipeline**: Drag-and-drop kanban stages, value tracking, close/loss
- [ ] **WhatsApp**: Send message, receive reply, AI auto-response
- [ ] **AI Sales Agent**: Automated qualification conversation in Arabic
- [ ] **AI Lead Scoring**: Tested with Arabic text input
- [ ] **CPQ**: Quote generation tested with VAT calculation
- [ ] **Reports**: Dashboard KPIs load correctly with real data
- [ ] **Settings**: Team invite, role change, profile update
- [ ] **PDPL consent**: Full consent flow tested end-to-end
- [ ] **Mobile**: All above flows work on mobile browsers
- [ ] **Industry templates**: 3 templates loaded (real estate, healthcare, contracting)

### Legal: PDPL Compliance
- [ ] Privacy policy published in Arabic at `/privacy`
- [ ] Terms of service published in Arabic at `/terms`
- [ ] Cookie consent banner implemented
- [ ] Consent collection points verified on all data entry forms
- [ ] Data subject rights page accessible at `/data-rights`
- [ ] PDPL consent purposes documented and match implementation
- [ ] Data processing records prepared for SDAIA audit
- [ ] Data breach notification procedure documented
- [ ] DPO (Data Protection Officer) appointed and contact info published
- [ ] Data processing agreement template ready for enterprise tenants

### Legal: Business Compliance
- [ ] Commercial Registration (CR) number displayed on website
- [ ] ZATCA VAT registration number configured
- [ ] ZATCA e-invoicing compliance verified for billing
- [ ] Payment Terms and Refund Policy published
- [ ] Acceptable Use Policy drafted

---

## T-1 Day: Final Checks

### Marketing: Landing Page & Channels
- [ ] Landing page live at `dealix.sa` with Arabic-first content
- [ ] English language toggle available
- [ ] Pricing page reflects final plans:
  - Starter: SAR 299/month
  - Professional: SAR 799/month
  - Enterprise: Custom pricing
- [ ] "Start Free Trial" button works end-to-end
- [ ] Social media accounts ready:
  - [ ] Twitter/X: `@DealixSA`
  - [ ] LinkedIn: Company page created
  - [ ] Instagram: Profile and launch teaser posted
- [ ] Launch post drafted in Arabic and English
- [ ] Launch email to waitlist drafted and scheduled
- [ ] WhatsApp Business profile configured
- [ ] Demo video ready (3 min, Arabic)
- [ ] First 5 blog posts published (SEO)

### Marketing: SEO & Analytics
- [ ] Google Analytics / Plausible installed
- [ ] `robots.txt` allows crawling
- [ ] `sitemap.xml` generated
- [ ] Open Graph meta tags on all public pages
- [ ] Arabic meta descriptions for SEO

### Support: Readiness
- [ ] Support email configured: `support@dealix.sa`
- [ ] Auto-reply configured in Arabic: "شكرا لتواصلك معنا. سنرد عليك خلال ٤ ساعات عمل"
- [ ] WhatsApp support number active with auto-routing
- [ ] FAQ page published (Arabic)
- [ ] First 48-hour monitoring schedule assigned:
  - Hours 0-12: [Primary on-call engineer]
  - Hours 12-24: [Secondary on-call engineer]
  - Hours 24-48: [Rotating coverage]
- [ ] Escalation contacts for critical issues (payment down, data loss, security)
- [ ] Known issues document prepared (what to tell users if X happens)

### Payment: Stripe Go-Live
- [ ] Stripe account switched to Live mode (not Test)
- [ ] Live API keys configured in production environment
- [ ] Webhook endpoint registered in Stripe Dashboard (production URL)
- [ ] Webhook secret updated in production env vars
- [ ] Test transaction processed with real card (refund immediately)
- [ ] Pricing configured in Stripe Products:
  - [ ] Starter: SAR 299/month
  - [ ] Professional: SAR 799/month
  - [ ] Enterprise: Custom (contact sales)
- [ ] Invoice templates customized with Dealix branding and ZATCA QR code
- [ ] Tax settings configured for Saudi Arabia (15% VAT)
- [ ] Customer portal URL configured for self-service billing
- [ ] Cancellation flow tested
- [ ] Refund process documented

---

## Launch Day (T-0)

### Morning: Pre-Launch (08:00 AST)
```bash
# Final health check
curl -f https://api.dealix.sa/api/v1/health
curl -f https://app.dealix.sa/

# Check all containers running
docker compose ps

# Check database connectivity
docker compose exec backend python3 -c "print('DB OK')"

# Check Redis
docker compose exec redis redis-cli ping

# Check Celery workers
docker compose exec celery-worker celery -A app.workers inspect ping

# Clear any stale caches
docker compose exec redis redis-cli FLUSHDB
```

- [ ] All health checks pass
- [ ] Team online in communication channel
- [ ] Status page shows "All Systems Operational"
- [ ] Sentry dashboard open and monitored

### Launch: Go Live (10:00 AST)
- [ ] Remove any "Coming Soon" or maintenance mode flags
- [ ] Enable signup for all visitors (not just waitlist)
- [ ] Publish launch post on social media (Arabic and English)
- [ ] Send launch email to waitlist
- [ ] Monitor signup funnel in real-time

### Launch: First Hour (10:00-11:00 AST)
- [ ] Monitor Sentry for new errors (should be zero critical)
- [ ] Watch server metrics (CPU < 70%, memory < 80%)
- [ ] Monitor database connections (should be within pool limits)
- [ ] Check first signups complete onboarding successfully
- [ ] Respond to any social media questions/issues immediately

### Launch: First Day Monitoring
- [ ] Error rate: < 0.1% of requests
- [ ] API latency P95: < 500ms
- [ ] Signup conversion: track funnel (visit -> signup -> onboard -> first action)
- [ ] WhatsApp delivery rate: > 95%
- [ ] Support tickets: categorize and prioritize incoming requests

---

## Post-Launch (T+1 to T+7)

### Day 1 Review
- [ ] Total signups and conversion rate
- [ ] Critical bugs found and fixed
- [ ] Support ticket volume and average response time
- [ ] Server performance metrics reviewed
- [ ] User feedback collected (what they love, what's confusing)

### Day 2-3: Stabilization
- [ ] Fix any P0/P1 bugs from launch day
- [ ] Optimize any slow queries identified in monitoring
- [ ] Scale infrastructure if growth exceeds projections
- [ ] Follow up personally with first 10 users for feedback
- [ ] Publish "thank you" social media post

### Day 4-7: Iteration
- [ ] Analyze onboarding drop-off points
- [ ] Plan quick wins based on user feedback
- [ ] Review billing conversion (free trial -> paid)
- [ ] Update FAQ based on common support questions
- [ ] Write first weekly internal report
- [ ] Plan Sprint 1 post-launch based on data

---

## Emergency Contacts

| Role | Name | Phone | Escalation |
|------|------|-------|------------|
| CTO / On-Call Lead | TBD | +966-5XX-XXX-XXXX | All critical issues |
| Backend Engineer | TBD | +966-5XX-XXX-XXXX | API, database, workers |
| Frontend Engineer | TBD | +966-5XX-XXX-XXXX | UI, performance |
| DevOps | TBD | +966-5XX-XXX-XXXX | Infrastructure, DNS, SSL |
| Stripe Support | — | — | https://support.stripe.com |
| UltraMSG Support | — | — | WhatsApp integration issues |

---

## Rollback Decision Tree

```
Issue detected
    |
    ├── Affects < 5% of users
    |   └── Hotfix in place, no rollback
    |
    ├── Affects payments
    |   └── Immediate rollback + Stripe webhook pause
    |
    ├── Affects data integrity
    |   └── Immediate rollback + DB restore from backup
    |
    ├── Affects WhatsApp messaging
    |   └── Disable AI auto-reply, switch to manual mode, fix forward
    |
    └── Total outage
        └── Full rollback per deployment-checklist.md procedure
```
