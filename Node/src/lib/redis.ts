import { Redis } from "ioredis";
import { Queue } from "bullmq";
const REDIS_URL = process.env.REDIS_URL!;

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: REDIS_URL.startsWith("redis://") ? {} : undefined,
});
export const bullmqConnection = {
  url: REDIS_URL,
  tls: REDIS_URL.startsWith("redis://") ? {} : undefined,
  maxRetriesPerRequest: null as null,
};

export const queue = new Queue("appointment", { connection: bullmqConnection });

redis.on("connect", () => {
  console.log("Redis connected");
});
redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});
