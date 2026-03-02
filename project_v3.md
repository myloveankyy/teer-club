# 🚀 Teer Club – Project V3 Documentation & Roadmap

**Status:** Live & Evolving  
**Date:** February 2026  
**Current Architecture:** Next.js (Frontend & Admin), Node.js/Express (Backend), PostgreSQL, Python FastAPI (ML Service)

---

## 🛑 1. The Journey So Far (Phases 1-15 Completed)

We have successfully transitioned Teer Club from a static information portal into a dynamic, credit-based, real-time prediction and community platform.

### ✅ Infrastructure & Core
- **Database:** Fully relational PostgreSQL schema (`users`, `groups`, `group_members`, `group_messages`, `wallet_transactions`, `user_bets`, `teer_results`, `predictions`).
- **Scraping Engine:** Automated and manual scrapers for Shillong, Khanapara, and Juwai pulling historical and daily results.
- **ML Service:** Python-based Analytics service computing Hot/Cold numbers and "Fire & Ice" predictions.

### ✅ User Application (Frontend)
- **Hyper-Premium UI:** Sleek, glassmorphic, mobile-first design tailored for Northeast Indian audiences.
- **Results & History:** Live tickers and searchable historical archives.
- **User Dashboard:** Profile management, Live Wallet Balance, Active Bets tracking, and comprehensive Transaction Ledgers.
- **Live Community Chat (WhatsApp-style):** Interactive groups (e.g., *Official VIP*, *Shillong Masterminds*) with real-time participation, lock-screens for non-members, and reputation badges.
- **Virtual Betting System:** Users can place secure credit-based wagers on Direct numbers and House/Ending configurations.

### ✅ Enterprise Admin Panel
- **Security:** Locked down, middleware-protected Next.js control center.
- **Results & Predictions Management:** Manual override capabilities for scraped results and ML predictions.
- **User & Reward Management:** Tracking registered users, banning capabilities, and an advanced **UPI-style Gifting System** for moderators to reward players.
- **Blog Engine:** Full CMS to publish SEO-optimized articles, managing grey-hat/white-hat SEO.
- **Group Management:** Ability to spin up new public/private chat communities and fund group wallets.

---

## 🔮 2. Future Enhancements & Next Phases (Phase 16+)

As we scale towards our 1M monthly traffic goal, the following phases are recommended to drastically increase revenue, user retention, and platform automation.

### 🌟 Phase 16: Real-Money Payment Gateway Integration (Web3 / UPI)
Currently, wallets operate on virtual/admin-granted credits. We need automated user deposits.
- **Automated Deposits:** Integrate Razorpay/Cashfree for UPI deposits, or a crypto gateway for offshore compliance.
- **Automated Withdrawals:** Allow users to request payouts, generating an admin queue for approval and processing.
- **Transaction Fees:** Implement a small platform rake on withdrawals to generate immediate revenue.

### 🌟 Phase 17: Automated Bet Settlement Engine
Right now, betting logic exists to *place* bets, but we need a robust bulletproof engine to *settle* them.
- **The Settlement Daemon:** A background chron-job that constantly monitors the `teer_results` table. Once a new official result is published, it queries all pending `user_bets` for that date/location.
- **Auto-Credit:** Winning bets instantly credit the user's wallet based on dynamic multipliers (e.g., 80x for Direct, 8x for House/Ending).
- **Push Notifications:** Instant browser notifications: *"Congratulations! Your Shillong FR prediction (42) hit! ₹800 added to your wallet."*

### 🌟 Phase 18: The Tipster Marketplace & Creator Economy
Capitalizing on our reputation system.
- **Selling Predictions:** Users with a high `reputation` score can lock their daily predictions behind a paywall (e.g., cost 50 credits to unlock).
- **Revenue Split:** Teer.Club takes a 20% cut of every prediction sold.
- **Creator Dashboards:** Allow top predictors to see their monthly earnings and subscriber counts.

### 🌟 Phase 19: Advanced Gamification & Leaderboards
- **Global Rankings:** Daily, Weekly, and All-Time leaderboards based on prediction accuracy and total winnings.
- **Profile Badges:** visual flair for active users (e.g., 'Shillong Sniper', 'Whale', 'Veteran').
- **Daily Login Rewards:** Encourage daily DAU spikes by offering 5-10 free credits for logging in 7 consecutive days.

### 🌟 Phase 20: Mobile App Deployment (React Native / Flutter)
- Wrap the Next.js application in WebViews or rebuild native variants.
- Launch on Android (APK format to bypass Play Store gambling restrictions initially).
- Implement native push notifications for vastly improved re-engagement when results are published.

### 🌟 Phase 21: Deep Learning ML V2
- Upgrade the Python ML backend from basic frequency analysis to LSTM (Long Short-Term Memory) neural networks.
- Offer "Premium AI" predictions as a monthly subscription package for users.

---

## 🛠 3. Technical Debt & Refactoring Checklist

Before scaling to millions of users, we should address the following engineering tasks:
- [] **Redis Caching Pipeline:** Introduce Redis for the Live Results API to handle intense traffic spikes at exactly 4:00 PM without bringing down the PostgreSQL database.
- [] **WebSockets Migration:** The community chat currently uses 5-second HTTP polling. Upgrade `routes/groups.js` to use `Socket.io` for true, zero-latency real-time chat and lower server overhead.
- [] **Enhanced Logging:** Integrate Sentry or Datadog to capture frontend JavaScript errors in real-time.

---

*This document serves as the master blueprint for all future agentic coding sessions. When initiating a new phase, reference this roadmap to ensure architectural alignment.*
