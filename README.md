# ProjectPile.tech - Personal PaaS Architecture

This repository contains the architecture and documentation for projectpile.tech, a central hub for hosting and managing personal projects. The root domain serves as a public-facing portfolio, while subdomains host individual applications and a private management dashboard.

## Stack at a Glance

| Component | Service/Technology | Purpose |
|-----------|-------------------|----------|
| DNS & CDN | Cloudflare | Global Traffic Routing, Security, Free SSL |
| Frontend Hosting | Vercel / Netlify | Static Sites, Jamstack Apps, Serverless Functions |
| Backend Hosting | Render / Railway | APIs, Databases, Background Services |
| Code Repository | GitHub | Version Control & CI/CD Trigger |

## Core Architecture

The system is designed with a separation of concerns philosophy. Instead of using a single, monolithic provider, we use specialized services for each part of the stack. This provides maximum flexibility, performance, and cost-effectiveness, preventing vendor lock-in.

### The three key components are:

1. **Domain Registrar**: The service where the domain was purchased. Its only job is to point to our DNS provider's nameservers.

2. **DNS Provider (Cloudflare)**: The central control panel for all traffic. It acts as the internet's phonebook, directing requests for projectpile.tech and all its subdomains (*.projectpile.tech) to the correct hosting provider.

3. **Hosting Providers (Vercel, Render)**: These are the services that actually store, build, and run the code. We use different providers based on the project's needs.

### Request Flow
```
User Request → Cloudflare (DNS) → Correct Hosting Provider (Vercel, Render, etc.)
```

## Deployment Workflow

### Step 1: Initial DNS Configuration (One-Time Setup)

1. Create a Cloudflare account and add projectpile.tech to it
2. Cloudflare will provide two nameserver addresses (e.g., zara.ns.cloudflare.com)
3. Log in to your domain registrar and replace the default nameservers with Cloudflare's

### Step 2: The Public-Facing Site (projectpile.tech)

#### Technology Options:
- **Astro** (Recommended): Exceptional performance and content-first approach
- **Next.js**: Powerful React ecosystem and developer experience

#### Deployment Steps:
1. Create a new project using your chosen SSG and push to GitHub
2. Import repository into Vercel
3. Add projectpile.tech in Vercel's "Domains" tab
4. Configure Cloudflare DNS with Vercel's provided A record

### Step 3: Hosting Individual Projects

#### Case A: Frontend / Static Projects
1. Deploy project to Vercel
2. Add subdomain in Vercel (e.g., cool-app.projectpile.tech)
3. Configure CNAME record in Cloudflare

#### Case B: Full-Stack / Backend Projects
1. Deploy to Render
2. Configure Custom Domain in Render
3. Add CNAME record in Cloudflare

## Project Lifecycle Management

### Updating Projects
- Push to main branch triggers automatic deployment
- Zero-downtime deployments handled by hosting providers

### Decommissioning Projects
1. Delete project from hosting provider
2. Remove DNS record from Cloudflare

## The Personal Dashboard (dashboard.projectpile.tech)

### Phase 1 (Recommended Start)
- Password-protected static site
- Links to all service dashboards
- Quick access to project repositories

### Phase 2 (Future Goal)
- Full-fledged web application
- API integration with all services
- Automated project creation and DNS configuration
