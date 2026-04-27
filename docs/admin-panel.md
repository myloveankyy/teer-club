# Admin Panel Guide

The Admin Panel (`/admin-panel`) is the management interface for the entire Teer Club infrastructure.

## Key Features

### 1. Dashboard (`/`)
- **System Stats**: Overview of total results, active games, and source health.
- **Queue Monitor**: Real-time status of BullMQ jobs (Active, Waiting, Failed).
- **Quick Scrape**: Global trigger for enqueuing all active sources.

### 2. Game Management (`/games`)
- **Active Games**: Enable or disable regions (Shillong, Khanapara, etc.).
- **Metadata**: Edit display names and regional settings.

### 3. Source Registry (`/sources`)
- **Source Control**: Individual URLs can be enabled/disabled.
- **AI Settings**: Configure which sources should use the LLM fallback for extraction.
- **Priority**: Rank sources (e.g., set official APIs to Priority 1).

### 4. Scheduler Control (`/scheduler`)
- **Real-time Status**: View the current mode of the adaptive scheduler (Active/Inactive).
- **Manual Overrides**: Stop or Start the scheduler independently of the cron cycle.

### 5. Scraping Monitor (`/monitor`)
- **Live Logs**: View detailed logs from the worker threads.
- **Performance**: Track token usage and costs for AI-based scraping.

## Technical Architecture
- **Framework**: Next.js 14+ (App Router).
- **State**: React Hooks + Local Storage (for settings).
- **Styling**: Tailwind CSS with an industry-grade dashboard layout.
- **Communication**: Interacts with the Backend API via a shared `api/client.ts`.
