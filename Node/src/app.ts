import fastify from "fastify";
import "dotenv/config";
import { routes } from "./routes.js";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";
import { redis } from "./lib/redis.js";
import rateLimit from "@fastify/rate-limit";
import jwt from "@fastify/jwt";
import "./workers/appointment.worker.js";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { FastifyAdapter } from "@bull-board/fastify";
import { queue } from "./lib/redis.js";
import multipart from "@fastify/multipart";
import helmet from "@fastify/helmet";
import fastifyCors from "@fastify/cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = fastify();

export const buildApp = async () => {
  await app.register(fastifyCors, {
    origin: ["http://localhost:3000", "https://clinic-api-krh9.onrender.com"],
    credentials: true,
  });
  await app.register(helmet, {
    global: true,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
        fontSrc: ["'self'", "fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "https://clinic-api-krh9.onrender.com"],
      },
    },
  });

  await app.register(fastifyStatic, {
    root: path.join(__dirname, "../public"),
    prefix: "/",
  });

  if (process.env.NODE_ENV !== "test") {
    await app.register(rateLimit, {
      global: true,
      redis,
      max: 100,
      timeWindow: "1 minute",
    });
  }

  await app.register(multipart);

  await app.register(jwt, {
    secret: process.env.JWT_SECRET as string,
  });

  await app.register(routes);

  const serverAdapter = new FastifyAdapter();

  createBullBoard({
    queues: [new BullMQAdapter(queue)],
    serverAdapter,
  });

  serverAdapter.setBasePath("/admin/queues");
  await app.register(serverAdapter.registerPlugin(), {
    prefix: "/admin/queues",
  });
  return app;
};
