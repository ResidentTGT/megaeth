import compress from "@fastify/compress";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { getApps } from "./appsService.js";
import type { AppConfig } from "./config.js";
import { getConfig } from "./config.js";
import {
  LeaderboardQueryError,
  parseLeaderboardQuery,
  selectLeaderboardPage,
} from "./leaderboardQuery.js";
import { getLeaderboard } from "./leaderboardService.js";

export const buildApp = async (
  config: AppConfig = getConfig(),
  logger: boolean = true
) => {
  const app = Fastify({
    logger,
  });

  await app.register(cors, {
    origin: config.frontendOrigins,
  });
  await app.register(compress, {
    global: true,
  });

  app.get("/health", async () => {
    return { ok: true };
  });

  app.get("/leaderboard", async (request, reply) => {
    try {
      const query = parseLeaderboardQuery(request.query);
      const leaderboard = await getLeaderboard(config);
      const response = query ? selectLeaderboardPage(leaderboard, query) : leaderboard;
      request.log.info(
        {
          cacheStatus: response.cache?.status,
          entries: response.entries.length,
          totalRows: response.pagination?.totalRows ?? response.entries.length,
        },
        "served leaderboard"
      );
      return response;
    } catch (error) {
      if (error instanceof LeaderboardQueryError) {
        return reply.code(400).send({
          error: error.message,
        });
      }

      request.log.error({ err: error }, "failed to serve leaderboard");
      return reply.code(502).send({
        error: "Unable to load leaderboard",
      });
    }
  });

  app.get("/apps", async (request, reply) => {
    try {
      const response = await getApps(config);
      request.log.info(
        {
          apps: response.apps.length,
          cacheStatus: response.cache?.status,
        },
        "served apps"
      );
      return response;
    } catch (error) {
      request.log.error({ err: error }, "failed to serve apps");
      return reply.code(502).send({
        error: "Unable to load apps",
      });
    }
  });

  return app;
};
