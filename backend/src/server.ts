import cors from "@fastify/cors";
import Fastify from "fastify";
import { getLeaderboard } from "./leaderboardService.js";

const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? "0.0.0.0";
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: FRONTEND_ORIGINS,
});

app.get("/health", async () => {
  return { ok: true };
});

app.get("/leaderboard", async () => {
  return getLeaderboard();
});

try {
  await app.listen({ port: PORT, host: HOST });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
