# Teer Club Modern Infrastructure

Comprehensive technical documentation for the Teer Club scraping and analytics platform.

## Project Vision
Teer Club is an industry-grade data service for Teer enthusiasts. It provides 100% accurate, high-fidelity results for 11+ regions (Shillong, Khanapara, Juwai, etc.) by combining automated API detection, deep web crawling, and AI-driven data extraction.

## Core Modules
- **Backend**: Node.js/TypeScript engine responsible for data ingestion, processing, and multi-layered verification.
- **Admin Panel**: Next.js dashboard for real-time monitoring, service control, and data auditing.
- **Frontend**: High-density SaaS-style user portal with real-time result tickers across all regions.

## Quick Links
- [System Architecture](./architecture.md)
- [Backend Jobs & Scrapers](./backend-jobs.md)
- [Admin Panel Guide](./admin-panel.md)
- [Frontend Integration](./frontend.md)
- [API Reference](./api.md)
- [Deployment Guide](./deployment.md)

## Tech Stack
- **Languages**: TypeScript, Node.js
- **Frontend**: Next.js 14+, Tailwind CSS, Framer Motion
- **Database**: PostgreSQL with Prisma ORM
- **Queue System**: BullMQ with Redis
- **Scraping**: Cheerio, Axios, OpenAI (AI Fallback), Custom Hybrid Engine
- **DevOps**: GitHub Actions (CI/CD), Docker
