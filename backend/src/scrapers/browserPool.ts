import { chromium, Browser, BrowserContext, Page } from "playwright";
import { logger } from "../utils/logger";

class BrowserPool {
  private browser: Browser | null = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;
  private contextCount = 0;
  private readonly MAX_CONTEXTS_BEFORE_RESTART = 500; // Restart browser periodically to free deep memory leaks

  async init(): Promise<void> {
    if (this.browser) return;
    if (this.isInitializing && this.initPromise) {
      return this.initPromise;
    }

    this.isInitializing = true;
    this.initPromise = (async () => {
      try {
        logger.info("[BrowserPool] 🚀 Launching persistent Chromium instance...");
        this.browser = await chromium.launch({
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--disable-gpu",
            "--no-first-run",
            "--no-zygote",
            "--single-process",
          ],
        });
        logger.info("[BrowserPool] ✅ Chromium instance ready.");
        
        // Handle unexpected disconnects
        this.browser.on("disconnected", () => {
          logger.warn("[BrowserPool] ⚠️ Chromium disconnected. Resetting pool...");
          this.browser = null;
        });

      } catch (error: any) {
        logger.error(`[BrowserPool] ❌ Failed to launch Chromium: ${error.message}`);
        this.browser = null;
      } finally {
        this.isInitializing = false;
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  async getContext(userAgent?: string): Promise<BrowserContext> {
    if (!this.browser) {
      await this.init();
    }

    if (!this.browser) {
      throw new Error("Failed to initialize browser pool");
    }

    this.contextCount++;

    // Proactive memory management: Restart browser if it has served too many contexts
    if (this.contextCount > this.MAX_CONTEXTS_BEFORE_RESTART) {
      logger.info(`[BrowserPool] Reached ${this.MAX_CONTEXTS_BEFORE_RESTART} contexts. Restarting Chromium for memory health...`);
      await this.close();
      this.contextCount = 0;
      await this.init();
    }

    const context = await this.browser.newContext({
      userAgent: userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0 Safari/537.36",
      bypassCSP: true,
      ignoreHTTPSErrors: true,
    });

    return context;
  }

  async close(): Promise<void> {
    if (this.browser) {
      logger.info("[BrowserPool] 🛑 Closing persistent Chromium instance...");
      try {
        await this.browser.close();
      } catch (err: any) {
        logger.error(`[BrowserPool] Error closing browser: ${err.message}`);
      }
      this.browser = null;
    }
  }
}

export const browserPool = new BrowserPool();
