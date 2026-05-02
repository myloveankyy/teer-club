module.exports = {
  apps: [
    {
      name: "teer-api",
      script: "dist/index.js",
      instances: "max", // Run in cluster mode across all CPU cores
      exec_mode: "cluster",
      max_memory_restart: "2G", // Safe restart limit
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "teer-worker",
      script: "dist/worker.js",
      instances: 1, // STRICTLY 1 to avoid duplicate scraping / cron issues
      exec_mode: "fork",
      max_memory_restart: "2G", // Safe restart limit for Playwright
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
