# Frontend Integration

The Frontend (`/frontend`) is the public portal for users to view Teer results and guidebooks.

## Connectivity Flow

### 1. Data Consumption
- **Rest API**: Fetches historical results and game lists from `/api/results` and `/api/games`.
- **Real-time Updates**: Uses `EventSource` (SSE) to listen for the `result:updated` event. This ensures that when a worker finds a number, it appears on the site in < 1 second.

### 2. Rendering Strategy
- **Static Site Generation (SSG)**: Historical archives and guide pages are pre-rendered for SEO excellence.
- **Client-Side Rendering (CSR)**: Live tickers and interactive common-number searches are rendered on the client for low latency.

## Key Components
- **MarketLiveCard**: High-density card showing current day's numbers with "Open/Closed" status.
- **ResultsTicker**: Low-latency top bar showing the latest win across all regions.
- **DreamNumberSearch**: Search engine for interpreting dreams into Teer numbers.

## Styling
- **Design System**: Modern SaaS aesthetic with glassmorphism effects and smooth Framer Motion transitions.
- **Icons**: Custom SVG icons for distinctive regional identities.
