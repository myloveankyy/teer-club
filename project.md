---

# Teer Club – Product Requirements Document (PRD)

**Project Name:** Teer Club
**Domain:** teer.club
**Platforms:** Web (Phase 1), Android & iOS (Phase 2)
**Prepared For:** Aniket Pradhan
**Date:** 2026-02-19

---

# 1. Executive Summary

Teer Club is an information and prediction analytics platform for Teer game enthusiasts. The initial phase focuses on delivering real-time Teer results, historical analytics, AI-based prediction insights, and a community-driven discussion forum. The primary business goal is to reach 1 million monthly organic users within 30–60 days and monetize traffic using Google AdSense and custom ads.

Phase 1 explicitly avoids real-money betting to ensure legal compliance and AdSense approval. Phase 2 will introduce premium analytics and subscriptions. Phase 3 may evolve into a real betting platform with separate legal and infrastructure requirements.

---

# 2. Goals & Success Metrics

## 2.1 Business Goals

* 1M monthly organic traffic within 30–60 days
* AdSense RPM target: ₹150–₹500
* Daily active users (DAU): 50,000+
* Telegram community: 100,000 subscribers

## 2.2 Product Goals

* Fastest Teer result delivery platform
* Most comprehensive Teer historical data archive
* AI-driven prediction insights with transparent disclaimers
* Largest Teer community forum in Northeast India

---

# 3. Target Users

## Primary Users

* Teer players in Assam, Meghalaya, Tripura
* Teer prediction followers and tip seekers

## Secondary Users

* Data analysts and enthusiasts
* Affiliate marketers and advertisers

---

# 4. Legal & Compliance Positioning

* Platform positioned as **information & analytics only**
* No real-money betting in Phase 1
* Clear disclaimers on prediction pages
* No payment processing in Phase 1

---

# 5. Core Features (Phase 1)

## 5.1 Live Teer Results System

* Shillong Teer Round 1 & Round 2 live results
* Countdown timer for next round
* Auto-refresh via ISR/WebSockets
* Source scraping + admin verification pipeline

## 5.2 Historical Results Archive

* Daily, monthly, yearly archives
* Date-based search
* Auto-generated SEO pages

## 5.3 AI Prediction System

* Hot and cold number detection
* Frequency-based forecasting
* Probability confidence score
* ML-based prediction service (Python FastAPI)
* Educational disclaimer

## 5.4 Teer Tools Suite

* Teer Calculator
* Number Frequency Analyzer
* Pattern Analyzer
* Probability Calculator

## 5.5 Community Forum

* Threads and categories (Predictions, Results, Strategies)
* User accounts and profiles
* Voting and reputation system
* Moderator roles

## 5.6 Blog & Knowledge Hub

* What is Teer
* Teer rules and history
* Strategy guides
* FAQs

---

# 6. SEO & Growth Architecture

## 6.1 Programmatic SEO

Auto-generated pages:

* /teer-result-today
* /teer-result-YYYY-MM-DD
* /teer-result-YYYY-month
* /teer-prediction-today
* /teer-common-number-today
* City-based result pages

## 6.2 Internal Linking Cluster

* Results → Predictions → Tools → Forum → Blog

## 6.3 Greyhat Growth Tactics

* Parasite SEO (Medium, Blogger, GitHub Pages)
* AI-generated recap and prediction posts
* Telegram auto-posting bot

---

# 7. Monetization Strategy

## Phase 1

* Google AdSense (primary)
* Custom native ads placements

## Phase 2

* Premium subscription for advanced AI predictions
* Tipster marketplace
  n## Phase 3
* Affiliate betting partnerships (outside India)
* Native advertising network

---

# 8. Technical Architecture

## 8.1 Frontend

* Next.js (App Router)
* Tailwind CSS + ShadCN
* ISR and SSR for SEO

## 8.2 Backend

* Node.js + Express
* PostgreSQL database
* Cron-based scraper service

## 8.3 ML Service

* Python FastAPI
* Pandas, Scikit-learn (Phase 1)
* LSTM/XGBoost (Phase 2)

## 8.4 Infrastructure (DigitalOcean)

* $6 Droplet (Node + Python services)
* Managed PostgreSQL (optional)
* Cloudflare CDN & DNS
* Future scaling via DO Load Balancer

---

# 9. Data Pipeline

1. Scraper fetches results from competitor sites
2. Data stored in staging DB
3. Admin panel verifies/edits
4. Approved data published to production DB
5. ML service generates prediction JSON

---

# 10. Admin Panel Requirements

* Manual result editor
* Prediction editor
* Forum moderation dashboard
* SEO content manager
* Ad placement control panel
* Role-based authentication

---

# 11. Database Schema (Core)

## Results

* id, date, round1, round2, source, verified

## Predictions

* id, date, number, confidence, model_version

## Users

* id, username, email, password_hash, reputation

## Forum

* threads, posts, votes, categories

---

# 12. UI/UX Design Vision

* Glassmorphism dark UI
* Neon cyan/purple financial terminal theme
* Live animated number ticker
* Mobile-first responsive layout
* SEO-optimized content blocks

---

# 13. Security & Performance

* Rate limiting on APIs
* Cloudflare WAF
* SSR caching & Redis (future)
* Bot detection on forum

---

# 14. Roadmap & Timeline

## Week 1

* Domain + Cloudflare
* Next.js setup
* Result scraper MVP

## Week 2

* Archive system
* Prediction logic v1
* Blog content templates

## Week 3

* Forum MVP
* Telegram bot automation
* SEO sitemap automation

## Week 4

* ML backend v1
* Push notifications
* AdSense integration

---

# 15. Risks & Mitigation

## Legal Risk

* Avoid betting UI in Phase 1
* Use disclaimers

## SEO Risk

* Competitor penalties → diversify traffic sources

## Scraper Failure

* Admin manual override system

---

# 16. Future Expansion (Phase 2 & 3)

* Mobile apps (Flutter / React Native)
* Premium prediction subscription
* Real betting platform (offshore infra)
* Blockchain prediction market
* AI personalized forecasting

---

# 17. KPIs & Analytics

* Organic traffic growth
* Ad RPM and CTR
* DAU/MAU
* Forum engagement rate
* Telegram click-through rate

---

# End of PRD

---
