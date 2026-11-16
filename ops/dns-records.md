# Cloudflare & Resend DNS Configuration (Task B-14 & Audit Item 16)

This document specifies the required DNS records for `boyconcept.com` to guarantee transactional email deliverability via Resend and satisfy strict 2024 DMARC enforcement (Gmail, Yahoo, Apple Mail).

## 1. Domain Summary

- **Primary Apex Domain**: `boyconcept.com`
- **Nameservers**: Cloudflare DNS
- **Transactional Email Provider**: Resend (`resend.com`)
- **Sender Address**: `hello@boyconcept.com` (or `bookings@boyconcept.com`)

---

## 2. Required DNS Records

| Type | Name / Host | Target / Value | TTL | Proxy Status | Purpose |
|---|---|---|---|---|---|
| **TXT** | `@` (or `boyconcept.com`) | `v=spf1 include:resend.com ~all` | Auto (1 min) | DNS only | SPF authorization for Resend |
| **CNAME** | `resend._domainkey` | `dkim.resend.com` | Auto | DNS only | DKIM cryptographic signature verification |
| **TXT** | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc-reports@boyconcept.com; pct=100; sp=none; aspf=r;` | Auto | DNS only | DMARC policy & failure reporting |
| **MX** | `bounces` (or `send`) | `feedback-smtp.resend.com` | Auto | DNS only (Priority 10) | Return-path bounce handling |
| **TXT** | `bounces` | `v=spf1 include:resend.com ~all` | Auto | DNS only | Subdomain return-path SPF |

---

## 3. Cloudflare Setup Instructions

1. Log into the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **DNS > Records** for `boyconcept.com`.
2. Add the **SPF TXT** record for `@`:
   - If an existing SPF record exists, merge it: `v=spf1 include:existing.com include:resend.com ~all`.
   - Never publish more than one SPF TXT record on the apex domain.
3. Add the **DKIM CNAME** record:
   - Name: `resend._domainkey`
   - Target: `dkim.resend.com`
   - **Crucial**: Ensure Proxy Status is set to **DNS Only (Grey Cloud)**. Cloudflare proxying breaks CNAME DKIM resolution.
4. Add the **DMARC TXT** record:
   - Name: `_dmarc`
   - Content: `v=DMARC1; p=none; pct=100;` (upgrade to `p=quarantine` or `p=reject` after 30 days of clean reports).
5. Verify domain status in the [Resend Dashboard](https://resend.com/domains) until status reports **Verified**.
