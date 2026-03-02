# 🚀 Teer Club – Project V4: Group Moderators, Wallet Delegation, and UI Enhancements

**Status:** Planning
**Focus:** Delegated Community Management, Premium UI, and Enterprise Notifications

---

## 🛑 Business Context & Goals
The objective of V4 is to decentralize user rewards by introducing a specific "Moderator" role within groups. Admins can fund a Group Wallet, and Moderators can distribute these funds to engage users, thereby building organic communities. Additionally, we need to vastly improve the UI of the Group pages (channel structure) and ensure robust, end-to-end notifications across both the public site and admin panel.

---

## 🛠 Feature Breakdown & Implementation Plan

### 🌟 Phase 18.1: Group Moderators & Wallet Delegation System
Currently, only Admins can add funds to users. We want a hierarchical system: `Admin -> Group Wallet -> Moderator -> User Wallet`.

**1. Database & Backend Enhancements:**
- Ensure `groups` table has a `wallet_balance` (Already present).
- Ensure `group_members` has a `role` column (Already present: `MEMBER` or `MODERATOR`).
- Create endpoints for Admins to fund a specific Group Wallet.
- Create endpoints for Moderators to search the full user database and transfer funds from their Group Wallet to a User's Wallet.
- Create a `group_transactions` ledger to track all these movements.

**2. Admin Panel Updates:**
- Enhance the Group Management UI.
- Allow Admins to assign the "Moderator" role to specific users in a group.
- Provide a UI for Admins to easily add funds directly to a group's wallet.

**3. Moderator Dashboard (Public Site):**
- Create a dedicated `/user/moderator-hub` or accessible from profile for users who are moderators.
- **Features:** 
  - View assigned group(s) and available wallet balance.
  - A user directory / search bar to find members.
  - A modal to securely transfer funds to a user, checking against the group balance.
  - Ledger of recent transfers made by the moderator.

### 🌟 Phase 18.2: Group Channel Page Redesign (Public Site)
Transforming the current `/groups/[id]` chat room into a full-fledged "Channel Page" that feels premium, highly dynamic, and native to mobile.

**1. UI/UX Upgrades:**
- **Hero/Header:** Beautiful glassmorphic header with the Group Icon, Title, Member Count, and animated tags.
- **Tabs/Navigation:** Implement sticky tabs (`Chat`, `About`, `Members`, `Leaderboard`).
- **Mobile Native Feel:** Ensure swiping gestures, bottom-sheet models for info, and smooth scroll behavior simulating a native iOS/Android app.
- **Engagement:** Crazier visual details (e.g., glowing borders, glowing text for premium groups, sleek micro-animations on joining).

### 🌟 Phase 18.3: End-to-End Enterprise Notification System
We built a `NotificationPoller` in Phase 17 for bet settlements. We need to expand this into an industry-grade system across the whole platform.

**1. Admin Panel Notifications:**
- Implement a similar polling/toast system in the `admin-panel` so Admins get live alerts (e.g., "New User Registered", "Suspicious Activity").
**2. Public Site Notifications Polish:**
- Ensure the toast UI handles multiple notification types flawlessly (`BET_WON`, `FUNDS_RECEIVED_FROM_MOD`, `SYSTEM_ALERT`).
- Implement beautiful fallback states if notifications fail to load or are empty.
- Ensure professional error boundaries and smooth dismissal animations.

---

## 📋 Next Steps
1. Approve this plan.
2. We will set up `task.md` with these action items.
3. We will begin executing Phase 18.1 (Database & Backend endpoints for the Delegation System).