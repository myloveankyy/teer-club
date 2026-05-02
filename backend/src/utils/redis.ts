import Redis, { RedisOptions } from "ioredis";
import { logger } from "./logger";

const redisOptions: RedisOptions = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
};

export const redis = new Redis(redisOptions);

redis.on("error", (error) => {
  logger.error("[Redis] Connection Error", error);
});

redis.on("connect", () => {
  logger.info("[Redis] Successfully connected to Redis server");
});
