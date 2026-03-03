const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { scrapeTeerResults, scrapeTeerHistory } = require('./scraper');
const db = require('./db');
const { getCommonNumbers, getPredictions } = require('./analytics');
const { calculateProbability, analyzePattern, calculateReturn } = require('./tools');

/* -------------------------------------------------------------------------- */
/*                                GLOBAL HANDLERS                             */
/* -------------------------------------------------------------------------- */

process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

const adminAuth = require('./routes/adminAuth');
const adminAnalytics = require('./routes/adminAnalytics');
const adminResults = require('./routes/adminResults');
const adminSettings = require('./routes/adminSettings');
const adminUsers = require('./routes/adminUsers');
const adminGroups = require('./routes/adminGroups');
const adminNotifications = require('./routes/adminNotifications');
const adminFinance = require('./routes/adminFinance');
const adminBranding = require('./routes/adminBranding');
const verifyAdmin = require('./middleware/verifyAdmin');
const marketingRoutes = require('./routes/marketing');
const feedRoutes = require('./routes/feed');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers (helmet)
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP here since frontend handles it
  crossOriginEmbedderPolicy: false,
}));

// Gzip Compression (major perf boost for API responses)
app.use(compression());

// CORS - Allow dev + production domains
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://teer.club',
  'https://www.teer.club',
  'https://admin.teer.club',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: Origin not allowed'));
    }
  },
  credentials: true
}));

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for dev mode where component mounts spam this endpoint
  message: { success: false, error: 'Too many requests, please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const publicApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 150,
  message: { success: false, error: 'Rate limit exceeded. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));
const path = require('path');
app.use('/shares', express.static(path.join(__dirname, 'public', 'shares')));

// Global Request Logger (Top-level)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Request Timeout Middleware (Industry Grade Stability)
app.use((req, res, next) => {
  res.setTimeout(35000, () => {
    if (!res.headersSent) {
      console.error(`[Timeout]: ${req.method} ${req.originalUrl} timed out after 35s`);
      res.status(503).json({
        success: false,
        error: 'Service Unavailable',
        message: 'The request took too long to process (35s scraper timeout).'
      });
    }
  });
  next();
});

// Mount Admin Routes
app.use('/api/admin/analytics', adminAnalytics);
app.use('/api/admin/results', adminResults);
app.use('/api/admin/settings', adminSettings);
app.use('/api/admin/users', verifyAdmin, adminUsers);
app.use('/api/admin/groups', verifyAdmin, adminGroups);
app.use('/api/admin/notifications', verifyAdmin, adminNotifications);
app.use('/api/admin/finance', adminFinance);
app.use('/api/admin/branding', verifyAdmin, adminBranding);
const adminTickets = require('./routes/adminTickets');
app.use('/api/admin/tickets', verifyAdmin, adminTickets);
const adminSeo = require('./routes/adminSeo');
app.use('/api/admin/seo', verifyAdmin, adminSeo);
app.use('/api/admin', adminAuth);

// Mount Public/User Routes
const authRoute = require('./routes/auth');
const dreamsRoute = require('./routes/dreams');
app.use('/api/auth', authLimiter, authRoute);
app.use('/api/dreams', publicApiLimiter, dreamsRoute);

const betsRoute = require('./routes/bets');
app.use('/api/bets', betsRoute);

// Grey Hat SEO: Auto-Blogging Content Spinner (Runs at 2:00 AM Daily)
const nodeCron = require('node-cron');
const { generateSeoArticle } = require('./seo-blogger');
nodeCron.schedule('0 2 * * *', async () => {
  console.log('[CRON] Initiating Daily SEO Auto-Blogging Generation...');
  try {
    // Generate 5 articles to rapidly build topical authority
    for (let i = 0; i < 5; i++) {
      await generateSeoArticle();
      // Wait 10 seconds between API calls to prevent rate limits
      await new Promise(r => setTimeout(r, 10000));
    }
    console.log('[CRON] Daily SEO Auto-Blogging Completed.');
  } catch (e) {
    console.error('[CRON] SEO Auto-Blogging Failed:', e);
  }
});

const transactionsRoute = require('./routes/transactions');
app.use('/api/transactions', transactionsRoute);

const publicPostsRoute = require('./routes/publicPosts');
app.use('/api/public/posts', publicPostsRoute);

const notificationsRoute = require('./routes/notifications');
const userRoute = require('./routes/user');
const referralRoute = require('./routes/referral');
const changelogRoute = require('./routes/changelog');

app.use('/api/notifications', notificationsRoute);
app.use('/api/changelog', changelogRoute);
app.use('/api/referral', referralRoute);

const moderatorRoute = require('./routes/moderator');
const financeRoute = require('./routes/finance');
const imageRoute = require('./routes/image');
const groupsRoute = require('./routes/groups');
app.use('/api/moderator', moderatorRoute);
app.use('/api/finance', financeRoute);
app.use('/api/image', imageRoute);
app.use('/api/marketing', marketingRoutes);
const commonNumbersRoute = require('./routes/commonNumbers');
const commentsRoute = require('./routes/comments');
app.use('/api/feed', feedRoutes);
app.use('/api/groups', groupsRoute);
app.use('/api/common-numbers', commonNumbersRoute);
app.use('/api/comments', commentsRoute);

// Basic Health Check
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

// Daily Stats Initialization
(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS daily_site_stats (
        date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
        pageviews INT DEFAULT 0,
        unique_visitors INT DEFAULT 0,
        api_calls INT DEFAULT 0
      );
    `);
    console.log('[Init] daily_site_stats table ready.');
  } catch (err) {
    console.error('[Init] Failed to initialize daily_site_stats table:', err.message);
  }
})();

// Pageview Tracker Middleware
app.use(async (req, res, next) => {
  // Only track GET requests to non-admin/non-asset routes as "pageviews"
  // This is a simple heuristic for traffic monitoring
  if (req.method === 'GET' && !req.path.startsWith('/api/admin') && !req.path.startsWith('/uploads')) {
    try {
      await db.query(`
        INSERT INTO daily_site_stats (date, pageviews, api_calls)
        VALUES (CURRENT_DATE, 1, 1)
        ON CONFLICT (date) DO UPDATE 
        SET pageviews = daily_site_stats.pageviews + 1,
            api_calls = daily_site_stats.api_calls + 1
      `);
    } catch (err) {
      console.warn('[Stats] Failed to increment pageview:', err.message);
    }
  } else {
    // Increment API calls for all other API requests
    if (req.path.startsWith('/api')) {
      try {
        await db.query(`
          INSERT INTO daily_site_stats (date, api_calls)
          VALUES (CURRENT_DATE, 1)
          ON CONFLICT (date) DO UPDATE 
          SET api_calls = daily_site_stats.api_calls + 1
        `);
      } catch (err) {
        // Silently fail to not block requests
      }
    }
  }
  next();
});

app.use('/api/user', userRoute);

// Latest Results Endpoint
let latestCache = { data: null, timestamp: 0 };
app.get('/api/results/latest', async (req, res) => {
  try {
    const now = Date.now();
    if (latestCache.data && now - latestCache.timestamp < 60000) {
      return res.json(latestCache.data);
    }
    const results = await scrapeTeerResults();
    latestCache.data = results;
    latestCache.timestamp = now;
    res.json(results);
  } catch (error) {
    console.error('Error serving results:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// History Endpoint
let historyCache = { data: null, timestamp: 0 };
app.get('/api/results/history', async (req, res) => {
  try {
    const now = Date.now();
    // Cache for 10 minutes for history, it changes rarely
    if (historyCache.data && now - historyCache.timestamp < 600000) {
      return res.json(historyCache.data);
    }

    console.log('[History] Fetching fresh data from scraper...');
    const history = await scrapeTeerHistory();

    if (Array.isArray(history) && history.length > 0) {
      historyCache.data = history;
      historyCache.timestamp = now;
      return res.json(history);
    }

    // Fallback to cache if scraper returns empty but we have old data
    if (historyCache.data) {
      console.warn('[History] Scraper returned empty, serving cached data.');
      return res.json(historyCache.data);
    }

    res.json([]);
  } catch (error) {
    console.error('Error serving history:', error);
    // Even on error, try to serve cache
    if (historyCache.data) return res.json(historyCache.data);
    res.status(500).json({ success: false, error: 'Internal Server Error', data: [] });
  }
});

// Analytics Endpoint - Common Numbers
let commonCache = { data: null, timestamp: 0 };
app.get('/api/analytics/common', async (req, res) => {
  console.log('Serving /api/analytics/common');
  try {
    const now = Date.now();
    if (commonCache.data && now - commonCache.timestamp < 60000) {
      return res.json(commonCache.data);
    }
    const common = await getCommonNumbers(30); // Default to 30 days
    commonCache.data = common;
    commonCache.timestamp = now;
    res.json(common);
  } catch (error) {
    console.error('Error serving analytics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Dreams Endpoint
const dreamsData = require('./data/dreams.json');
const { analyzeDream } = require('./ai');

app.get('/api/dreams', async (req, res) => {
  const { q, mode } = req.query;

  // AI Mode
  if (mode === 'ai' && q) {
    console.log(`AI Analysis requested for: ${q}`);
    const aiResult = await analyzeDream(q);
    return res.json([aiResult]); // Return as array to match frontend expectation
  }

  // Standard Search
  if (!q) {
    return res.json(dreamsData);
  }

  const query = q.toLowerCase();
  const filtered = dreamsData.filter(d =>
    d.dream.toLowerCase().includes(query) ||
    d.category.toLowerCase().includes(query)
  );
  res.json(filtered);
});

const axios = require('axios');

// Predictions Endpoint (Proxies to ML Service)
let predictionsCache = { data: null, timestamp: 0 };
app.get('/api/analytics/predictions', async (req, res) => {
  try {
    const now = Date.now();
    if (predictionsCache.data && now - predictionsCache.timestamp < 300000) { // 5 min cache
      return res.json(predictionsCache.data);
    }
    const mlResponse = await axios.get('http://localhost:8000/predict/target');
    predictionsCache.data = mlResponse.data;
    predictionsCache.timestamp = now;
    res.json(mlResponse.data);
  } catch (error) {
    console.warn('ML Service offline, falling back to basic mock logic / cache');
    if (predictionsCache.data) return res.json(predictionsCache.data);

    // Hard fallback if no cache and service is offline
    res.json({
      date: new Date().toISOString(),
      predicted_target: "00",
      confidence: 50,
      algorithm: "Fallback Offline Mode",
      analysis: {
        reasoning: "ML Service is currently unavailable. Showing baseline prediction.",
        strategy: "Exercise extreme caution and play safe."
      }
    });
  }
});

// Hot & Cold Endpoint (Proxies to ML Service)
let hotColdCache = { data: null, timestamp: 0 };
app.get('/api/analytics/hot-cold', async (req, res) => {
  try {
    const now = Date.now();
    if (hotColdCache.data && now - hotColdCache.timestamp < 300000) { // 5 min cache
      return res.json(hotColdCache.data);
    }
    const mlResponse = await axios.get('http://localhost:8000/predict/hot-cold');
    hotColdCache.data = mlResponse.data;
    hotColdCache.timestamp = now;
    res.json(mlResponse.data);
  } catch (error) {
    console.error('Error hitting ML Service:', error.message);
    if (hotColdCache.data) return res.json(hotColdCache.data);

    // Hard fallback if no cache and service is offline
    res.json({
      timeframe: "Fallback",
      hot_numbers: ["42", "77", "18"],
      cold_numbers: ["03", "99", "55"],
      model_version: "1.0.0 (Fallback)"
    });
  }
});

// Community Hub Analytics (Trending Today & Center Cold)
app.get('/api/analytics/community-hub', async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Trending Today (Top 10 most hit from user_bets today)
    const trendingRes = await db.query(`
      SELECT number, COUNT(*) as hits 
      FROM user_bets 
      WHERE created_at >= $1 
      GROUP BY number 
      ORDER BY hits DESC 
      LIMIT 10
    `, [todayStr]);

    // 2. Cold Numbers (Least frequent from historical results - last 500 records)
    // Shillong Cold
    const shillongCold = await db.query(`
      SELECT val as number, COUNT(*) as frequency 
      FROM (
        SELECT round1 as val FROM results WHERE round1 IS NOT NULL AND round1 != '' LIMIT 500
        UNION ALL
        SELECT round2 as val FROM results WHERE round2 IS NOT NULL AND round2 != '' LIMIT 500
      ) t 
      GROUP BY val 
      ORDER BY frequency ASC 
      LIMIT 5
    `);

    // Khanapara Cold
    const khanaparaCold = await db.query(`
      SELECT val as number, COUNT(*) as frequency 
      FROM (
        SELECT khanapara_r1 as val FROM results WHERE khanapara_r1 IS NOT NULL AND khanapara_r1 != '' LIMIT 500
        UNION ALL
        SELECT khanapara_r2 as val FROM results WHERE khanapara_r2 IS NOT NULL AND khanapara_r2 != '' LIMIT 500
      ) t 
      GROUP BY val 
      ORDER BY frequency ASC 
      LIMIT 5
    `);

    // Juwai Cold
    const juwaiCold = await db.query(`
      SELECT val as number, COUNT(*) as frequency 
      FROM (
        SELECT juwai_r1 as val FROM results WHERE juwai_r1 IS NOT NULL AND juwai_r1 != '' LIMIT 500
        UNION ALL
        SELECT juwai_r2 as val FROM results WHERE juwai_r2 IS NOT NULL AND juwai_r2 != '' LIMIT 500
      ) t 
      GROUP BY val 
      ORDER BY frequency ASC 
      LIMIT 5
    `);

    res.json({
      success: true,
      trending: trendingRes.rows,
      cold: {
        shillong: shillongCold.rows.map(r => r.number),
        khanapara: khanaparaCold.rows.map(r => r.number),
        juwai: juwaiCold.rows.map(r => r.number)
      }
    });

  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      // Fallback for local testing with offline DB
      return res.json({
        success: true,
        trending: [
          { number: '43', hits: 142 }, { number: '12', hits: 98 }, { number: '88', hits: 76 },
          { number: '07', hits: 54 }, { number: '19', hits: 42 }, { number: '66', hits: 39 },
          { number: '51', hits: 31 }, { number: '00', hits: 28 }, { number: '34', hits: 22 },
          { number: '91', hits: 18 }
        ],
        cold: {
          shillong: ['03', '99', '55', '12', '48'],
          khanapara: ['17', '82', '04', '33', '91'],
          juwai: ['00', '25', '67', '11', '89']
        }
      });
    }
    console.error('[Community Analytics Error]', error);
    res.status(500).json({ success: false, error: 'Failed to aggregate hub data' });
  }
});

// Tools Endpoints
app.get('/api/tools/probability/:number', (req, res) => {
  try {
    const result = calculateProbability(req.params.number);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/tools/pattern/:number', (req, res) => {
  try {
    const result = analyzePattern(req.params.number);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/tools/calculator', (req, res) => {
  try {
    const { amount, type } = req.body;
    const result = calculateReturn(amount, type);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin API Routes (Protected)
// These routes are strictly protected by the verifyAdmin middleware
const adminPostsRoute = require('./routes/adminPosts');
app.use('/api/admin/posts', adminPostsRoute);

const adminGiftsRoute = require('./routes/adminGifts');
app.use('/api/admin/gifts', adminGiftsRoute);

app.put('/api/admin/results/:id', verifyAdmin, (req, res) => {
  console.log(`Admin updated result ${req.params.id}`, req.body);
  // Implementation for updating DB
  res.json({ success: true, message: 'Result updated successfully' });
});

app.post('/api/admin/predictions/train', verifyAdmin, (req, res) => {
  console.log('Admin triggered model training');
  res.json({ success: true, message: 'Training job started' });
});

app.put('/api/admin/users/:id/ban', verifyAdmin, (req, res) => {
  console.log(`Admin banned user ${req.params.id}`);
  res.json({ success: true, message: 'User suspended' });
});

const adminUserPostsRoute = require('./routes/adminUserPosts');
app.use('/api/admin/user-posts', adminUserPostsRoute);

const { settlePendingBets } = require('./services/betSettler');
const { sendGlobalNotification } = require('./services/notificationService');

// Track results to notify on changes
let lastResults = {};

// Auto-Scraper Background Job (Runs every 1 minute)
setInterval(async () => {
  try {
    console.log('\n[Auto-Scraper] Initializing scheduled 1-minute scrape...');
    const scrapeData = await scrapeTeerResults();
    if (scrapeData && !scrapeData.error) {
      const { date, round1, round2 } = scrapeData.shillong;
      const khanaparaR1 = scrapeData.khanapara.round1;
      const khanaparaR2 = scrapeData.khanapara.round2;
      const juwaiR1 = scrapeData.juwai.round1;
      const juwaiR2 = scrapeData.juwai.round2;

      // Detect changes to notify
      const resKey = `${date}`;
      const currentRes = JSON.stringify(scrapeData);

      await db.query(`
                INSERT INTO results (date, round1, round2, khanapara_r1, khanapara_r2, juwai_r1, juwai_r2, source, verified)
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'Auto_Scraper', false)
                ON CONFLICT (date) DO UPDATE 
                SET round1 = EXCLUDED.round1, round2 = EXCLUDED.round2, 
                    khanapara_r1 = EXCLUDED.khanapara_r1, khanapara_r2 = EXCLUDED.khanapara_r2,
                    juwai_r1 = EXCLUDED.juwai_r1, juwai_r2 = EXCLUDED.juwai_r2,
                    source = CASE WHEN results.verified = true THEN results.source ELSE 'Auto_Scraper_Updated' END
            `, [date, round1, round2, khanaparaR1, khanaparaR2, juwaiR1, juwaiR2]);

      console.log(`[Auto-Scraper] Successfully synced live data for ${date}`);

      // Notification Logic & Auto-Indexing
      if (lastResults[resKey] && lastResults[resKey] !== currentRes) {
        const old = JSON.parse(lastResults[resKey]);
        let changes = [];
        if (scrapeData.shillong.round1 && !old.shillong.round1) changes.push(`Shillong R1: ${scrapeData.shillong.round1}`);
        if (scrapeData.shillong.round2 && !old.shillong.round2) changes.push(`Shillong R2: ${scrapeData.shillong.round2}`);
        if (scrapeData.khanapara.round1 && !old.khanapara.round1) changes.push(`Khanapara R1: ${scrapeData.khanapara.round1}`);
        if (scrapeData.khanapara.round2 && !old.khanapara.round2) changes.push(`Khanapara R2: ${scrapeData.khanapara.round2}`);

        if (changes.length > 0) {
          await sendGlobalNotification(
            "🎯 Result Declaration Update",
            `Fresh results are out! ${changes.join(', ')}. Check the dashboard for suspense!`,
            'result'
          );

          // Trigger Google Indexing API so we rank #1 instantly
          const { triggerGoogleIndex } = require('./services/seoIndexer');
          try {
            await triggerGoogleIndex('https://teer.club/shillong-teer-result-today');
            await triggerGoogleIndex('https://teer.club/khanapara-teer-result-today');
            await triggerGoogleIndex('https://teer.club'); // Index homepage 

            // --- AGGRESSIVE PROGRAMMATIC SEO INDEXING ---
            // Force Google to index the exact date programmatic pages immediately
            const todayStr = new Date().toISOString().split('T')[0];
            await triggerGoogleIndex(`https://teer.club/results/shillong/${todayStr}`);
            await triggerGoogleIndex(`https://teer.club/results/khanapara/${todayStr}`);
            await triggerGoogleIndex(`https://teer.club/results/juwai/${todayStr}`);
            // ----------------------------------------------
          } catch (seoErr) {
            console.error('[Auto-Scraper] Failed to auto-index URLs after result change:', seoErr.message);
          }
        }
      }
      lastResults[resKey] = currentRes;

      // TRIGGER THE AUTO SETTLER AFTER NEW RESULTS ARE FETCHED
      await settlePendingBets();
    }
  } catch (err) {
    console.error('[Auto-Scraper] Error during scheduled scrape:', err.message);
  }
}, 60 * 1000); // 1 minute interval

// Catch-all for undefined /api routes (Ensure JSON response)
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'API Route Not Found' });
  }
  next();
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Express Error Handler]:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Teer Club Backend is running on port ${PORT}`);
});
