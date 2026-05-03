import cors from "@fastify/cors";
import Fastify from "fastify";
import { getConfig } from "./config.js";
import { getLeaderboard } from "./leaderboardService.js";

const config = getConfig();

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: config.frontendOrigins,
});

app.get("/health", async () => {
  return { ok: true };
});

app.get("/leaderboard", async (request, reply) => {
  try {
    return await getLeaderboard(config);
  } catch (error) {
    request.log.error({ err: error }, "failed to serve leaderboard");
    return reply.code(502).send({
      error: "Unable to load leaderboard",
    });
  }
});

try {
  await app.listen({ port: config.port, host: config.host });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
